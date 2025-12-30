// utils/get-updated-fields.ts

export function getUpdatedFields<T extends Record<string, any>>(
  oldData: T,
  newData: Partial<T>,
  includedKeys: (keyof T)[] = [],
  returnAsLogs = false,
): Record<string, { from: any; to: any }> | string[] {
  const updatedFields: Record<string, { from: any; to: any }> = {};
  const changes: string[] = [];

  const toReadableName = (str: string) =>
    str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const getEntityValue = (entity: any): string => {
    if (!entity) return '';
    if (entity.name) return entity.name;
    if (entity.first_name) return `${entity.first_name} ${entity.last_name}`;
    if (entity.id) return entity.id;
    return String(entity);
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') return getEntityValue(value);
    return String(value ?? '');
  };

  Object.keys(newData).forEach((key) => {
    if (!includedKeys.includes(key as keyof T)) return;

    const oldValue = oldData[key];
    const newValue = newData[key];

    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      if (oldValue?.id === newValue?.id) return;
    }

    const isDifferent = oldValue !== newValue;

    if (isDifferent) {
      updatedFields[key] = { from: oldValue, to: newValue };

      if (returnAsLogs) {
        changes.push(
          `${toReadableName(key)} changed from "${formatValue(
            oldValue,
          )}" to "${formatValue(newValue)}"`,
        );
      }
    }
  });

  return returnAsLogs ? changes : updatedFields;
}
export function getDeepUpdatedFields<T extends Record<string, any>>(
  oldData: T,
  newData: Partial<T>,
  includedKeys: string[] = [],
  returnAsLogs = false,
): Record<string, { from: any; to: any }> | string[] {
  const updatedFields: Record<string, { from: any; to: any }> = {};
  const changes: string[] = [];

  // ========== HELPER FUNCTIONS ==========

  const toReadableName = (str: string): string => {
    return str
      .split('.')
      .map((part) =>
        part
          .split('_')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' '),
      )
      .join(' ');
  };

  const getEntityValue = (entity: any): string => {
    if (!entity) return '';
    if (entity.name) return entity.name;
    if (entity.first_name)
      return `${entity.first_name} ${entity.last_name ?? ''}`.trim();
    if (entity.abbreviation) return entity.abbreviation;
    if (entity.id) return entity.id;
    return String(entity);
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.map(getEntityValue).filter(Boolean).join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return getEntityValue(value);
    }
    return String(value ?? '');
  };

  // Memoize path lookups
  const pathCache = new Map<string, any>();

  const getValueByPath = (obj: any, path: string): any => {
    const cacheKey = `${obj === oldData ? 'old' : 'new'}:${path}`;

    if (pathCache.has(cacheKey)) {
      return pathCache.get(cacheKey);
    }

    const parts = path.split('.');
    let result = obj;

    for (const part of parts) {
      if (result == null) {
        result = undefined;
        break;
      }
      result = result[part];
    }

    pathCache.set(cacheKey, result);
    return result;
  };

  // ========== ARRAY COMPARISON ==========

  const normalizeArray = (arr: any[]): string => {
    return arr
      .map((item) =>
        typeof item === 'object' && item !== null
          ? (item.id ?? JSON.stringify(item))
          : String(item),
      )
      .sort()
      .join('|');
  };

  const arraysAreEqual = (arr1: any[], arr2: any[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    return normalizeArray(arr1) === normalizeArray(arr2);
  };

  // ========== OBJECT COMPARISON ==========

  const objectsAreEqual = (obj1: any, obj2: any): boolean => {
    // Quick ID check
    if (obj1?.id && obj2?.id) {
      return obj1.id === obj2.id;
    }

    // Deep comparison (only if needed)
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  // ========== CHANGE DETECTION ==========

  const recordChange = (key: string, oldValue: any, newValue: any): void => {
    updatedFields[key] = { from: oldValue, to: newValue };

    if (returnAsLogs) {
      const readableName = toReadableName(key);
      const formattedOld = formatValue(oldValue);
      const formattedNew = formatValue(newValue);
      changes.push(
        `${readableName} changed from "${formattedOld}" to "${formattedNew}"`,
      );
    }
  };

  const processKey = (key: string): void => {
    const oldValue = getValueByPath(oldData, key);
    const newValue = getValueByPath(newData, key);

    // Array handling
    if (Array.isArray(oldValue) || Array.isArray(newValue)) {
      const oldArr = Array.isArray(oldValue) ? oldValue : [];
      const newArr = Array.isArray(newValue) ? newValue : [];

      if (!arraysAreEqual(oldArr, newArr)) {
        recordChange(key, oldArr, newArr);
      }
      return;
    }

    // Object handling
    if (
      typeof oldValue === 'object' &&
      oldValue !== null &&
      typeof newValue === 'object' &&
      newValue !== null
    ) {
      if (!objectsAreEqual(oldValue, newValue)) {
        recordChange(key, oldValue, newValue);
      }
      return;
    }

    // Primitive comparison
    if (oldValue !== newValue) {
      recordChange(key, oldValue, newValue);
    }
  };

  // ========== WILDCARD EXPANSION ==========

  const expandedKeys = new Set<string>();

  for (const keyPattern of includedKeys) {
    if (keyPattern.endsWith('.*')) {
      const parentPath = keyPattern.slice(0, -2);
      const oldParent = getValueByPath(oldData, parentPath) || {};
      const newParent = getValueByPath(newData, parentPath) || {};

      // Combine keys efficiently
      const subKeys = new Set([
        ...Object.keys(oldParent),
        ...Object.keys(newParent),
      ]);

      for (const subKey of subKeys) {
        expandedKeys.add(`${parentPath}.${subKey}`);
      }
    } else {
      expandedKeys.add(keyPattern);
    }
  }

  // Process all keys
  for (const key of expandedKeys) {
    processKey(key);
  }

  return returnAsLogs ? changes : updatedFields;
}
