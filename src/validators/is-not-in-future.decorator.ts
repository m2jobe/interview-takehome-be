import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotInFuture(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotInFuture',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Ensure the value is a date string
          const date = new Date(value);
          const now = new Date();
          console.log('date', date);
          return !isNaN(date.getTime()) && date <= now; // Check if the date is not in the future
        },
        defaultMessage() {
          return `${propertyName} should not be in the future`;
        },
      },
    });
  };
}
