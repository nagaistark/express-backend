import { Document } from 'mongoose';

/**
 * Prevents a field from reverting to null once it has been set.
 * @param fieldName - The name of the field to protect.
 */
export function validateNonNullableOnceSet(fieldName: string) {
   return function (this: Document, value: unknown): boolean {
      const original = this.get(fieldName);
      return original === null || value !== null;
   };
}
