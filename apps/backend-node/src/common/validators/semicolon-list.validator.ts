import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function parseSemicolonList(raw: string): string[] {
  return raw
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

@ValidatorConstraint({ name: 'isSemicolonList', async: false })
export class IsSemicolonListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return parseSemicolonList(value).length > 0;
  }

  defaultMessage(): string {
    return 'must be a semicolon separated list with at least one non-empty element';
  }
}

@ValidatorConstraint({ name: 'isSemicolonNumericList', async: false })
export class IsSemicolonNumericListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const values = parseSemicolonList(value);
    if (values.length === 0) {
      return false;
    }
    return values.every((item) => !Number.isNaN(Number(item)));
  }

  defaultMessage(): string {
    return 'must be a semicolon separated list of numeric values';
  }
}

@ValidatorConstraint({ name: 'isSemicolonListAligned', async: false })
export class IsSemicolonListAlignedConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const [relatedProperty] = args.constraints as [string];
    const relatedValue = (args.object as Record<string, unknown>)[relatedProperty];
    if (typeof relatedValue !== 'string') {
      return false;
    }
    return parseSemicolonList(value).length === parseSemicolonList(relatedValue).length;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedProperty] = args.constraints as [string];
    return `must contain the same number of elements as ${relatedProperty}`;
  }
}

export function IsSemicolonList(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSemicolonListConstraint,
    });
  };
}

export function IsSemicolonNumericList(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSemicolonNumericListConstraint,
    });
  };
}

export function IsSemicolonListAligned(
  relatedProperty: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [relatedProperty],
      validator: IsSemicolonListAlignedConstraint,
    });
  };
}
