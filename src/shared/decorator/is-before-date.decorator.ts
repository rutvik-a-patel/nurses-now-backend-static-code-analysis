import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// allow to same date then pass inclusive = true
export function IsBeforeDate(
  property: string,
  inclusive = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeDate',
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
          if (!value || !relatedValue) return true; // let other validators handle empties
          const a = new Date(value);
          const b = new Date(relatedValue);
          if (isNaN(a.getTime()) || isNaN(b.getTime())) return false;
          return inclusiveFlag
            ? a.getTime() <= b.getTime()
            : a.getTime() < b.getTime();
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
