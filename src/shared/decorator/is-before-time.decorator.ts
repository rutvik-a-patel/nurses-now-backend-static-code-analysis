import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function toSeconds(time: any): number | null {
  if (typeof time !== 'string') return null;
  const m = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10),
    min = parseInt(m[2], 10),
    s = m[3] ? parseInt(m[3], 10) : 0;
  if (h > 23 || min > 59 || s > 59) return null;
  return h * 3600 + min * 60 + s;
}

// inclusive=true allows same time (<=)
export function IsBeforeTime(
  property: string,
  inclusive = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeTime',
      target: object.constructor,
      propertyName,
      constraints: [property, inclusive],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, inclusiveFlag] = args.constraints as [
            string,
            boolean,
          ];
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!value || !relatedValue) return true;
          const a = toSeconds(value);
          const b = toSeconds(relatedValue);
          if (a === null || b === null) return false;
          return inclusiveFlag ? a <= b : a < b;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, inclusiveFlag] = args.constraints as [
            string,
            boolean,
          ];
          return inclusiveFlag
            ? `${args.property} must be on or before ${relatedPropertyName}`
            : `${args.property} must be before ${relatedPropertyName}`;
        },
      },
    });
  };
}
