import {
   type InferOutput,
   type BaseSchema,
   type BaseSchemaAsync,
} from 'valibot';
import { EMBEDDED_ARRAY_FIELDS } from '@lib/constants';
import { extractArrayFields } from '@utils/extractArrayFields';

import { CreatePatientVSchema, patientArrayKeys } from '@schemas/Patient';

// Generic utility to find all keys pointing to array types
type ArrayKeys<T> = Extract<
   {
      [K in keyof T]: T[K] extends readonly any[] ? K : never;
   }[keyof T],
   string
>;

/**
 * A generic type that derives type-safe array keys from a Valibot schema,
 * while validating and excluding a given set of exception keys.
 */
export type TypeSafeArrayKeys<TOutput> = Exclude<
   ArrayKeys<TOutput>,
   (typeof EMBEDDED_ARRAY_FIELDS)[number]
>;

/**
 * Creates a runtime validation function to ensure a static list of array keys
 * matches the reality of the Valibot schema.
 */
export function verifyArrayKeySync<
   TSchema extends BaseSchema<any, any, any> | BaseSchemaAsync<any, any, any>,
   TExpectedKeys extends readonly TypeSafeArrayKeys<InferOutput<TSchema>>[],
>(schema: TSchema, staticKeys: TExpectedKeys): true {
   // Get the array fields from the schema at runtime
   const runtimeKeys = extractArrayFields(schema, {
      EXCEPTIONS: [...EMBEDDED_ARRAY_FIELDS],
   });

   const runtimeSet = new Set(runtimeKeys);
   const staticSet = new Set(staticKeys);

   // Find keys that exist in one list but not the other
   const missingFromStatic = [...runtimeSet].filter(
      key => !staticSet.has(key as TExpectedKeys[number])
   );
   const missingFromRuntime = [...staticSet].filter(
      key => !runtimeSet.has(key)
   );

   if (missingFromStatic.length > 0 || missingFromRuntime.length > 0) {
      throw new Error(
         `Schema-to-type mismatch detected for "${(schema as any).type}":
         - Keys in schema but not in type: [${missingFromStatic.join(', ')}]
         - Keys in type but not in schema: [${missingFromRuntime.join(', ')}]`
      );
   }
   return true;
}
