import { ObjectId } from 'mongodb';

interface StringOptions {
  lowercase?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  trim?: boolean;
}

export class DocumentValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = 'DocumentValidationError';
  }
}

export function readRecord(
  value: unknown,
  field: string,
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new DocumentValidationError(field, 'must be an object');
  }

  return value as Record<string, unknown>;
}

export function readString(
  value: unknown,
  field: string,
  options: StringOptions = {},
): string {
  if (typeof value !== 'string') {
    throw new DocumentValidationError(field, 'must be a string');
  }

  let result = options.trim ? value.trim() : value;
  result = options.lowercase ? result.toLowerCase() : result;

  if (result.length === 0) {
    throw new DocumentValidationError(field, 'is required');
  }

  if (options.minLength !== undefined && result.length < options.minLength) {
    throw new DocumentValidationError(
      field,
      `must be at least ${options.minLength} characters long`,
    );
  }

  if (options.maxLength !== undefined && result.length > options.maxLength) {
    throw new DocumentValidationError(
      field,
      `must not exceed ${options.maxLength} characters`,
    );
  }

  if (options.pattern && !options.pattern.test(result)) {
    throw new DocumentValidationError(field, 'has an invalid format');
  }

  return result;
}

export function readOptionalString(
  value: unknown,
  field: string,
  options: Omit<StringOptions, 'minLength'> = {},
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new DocumentValidationError(field, 'must be a string');
  }

  let result = options.trim ? value.trim() : value;
  result = options.lowercase ? result.toLowerCase() : result;

  if (options.maxLength !== undefined && result.length > options.maxLength) {
    throw new DocumentValidationError(
      field,
      `must not exceed ${options.maxLength} characters`,
    );
  }

  if (options.pattern && !options.pattern.test(result)) {
    throw new DocumentValidationError(field, 'has an invalid format');
  }

  return result;
}

export function readObjectId(value: unknown, field: string): ObjectId {
  if (!(value instanceof ObjectId)) {
    throw new DocumentValidationError(field, 'must be a MongoDB ObjectId');
  }

  return value;
}

export function readObjectIdArray(value: unknown, field: string): ObjectId[] {
  if (!Array.isArray(value)) {
    throw new DocumentValidationError(field, 'must be an array');
  }

  return value.map((item, index) => readObjectId(item, `${field}.${index}`));
}

export function readDate(value: unknown, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DocumentValidationError(field, 'must be a valid Date');
  }

  return value;
}

export function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new DocumentValidationError(field, 'must be a boolean');
  }

  return value;
}

export function readNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new DocumentValidationError(field, 'must be a finite number');
  }

  return value;
}

export function readEnum<const T extends readonly string[]>(
  value: unknown,
  field: string,
  allowedValues: T,
): T[number] {
  if (typeof value !== 'string' || !allowedValues.includes(value)) {
    throw new DocumentValidationError(
      field,
      `must be one of: ${allowedValues.join(', ')}`,
    );
  }

  return value as T[number];
}
