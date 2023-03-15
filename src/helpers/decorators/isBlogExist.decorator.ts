/*import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsBlogExistValidator } from '../validators/isBlogExistById.validator';

export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsBlogExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBlogExistValidator,
    });
  };
}*/
