import type { ObjectSchema, ObjectSchemaAsync } from 'valibot';

const OBJECT_TYPES = new Set(['object', 'object_async', 'strict_object']);

// Use a WeakMap for memoization to prevent memory leaks.
const _memoizedArrayFieldMap = new WeakMap<object, string[]>();

/**
 * A type guard to check if the provided schema is a Valibot object schema.
 */
function isValibotObjectSchema(
   schema: unknown
): schema is ObjectSchema<any, any> | ObjectSchemaAsync<any, any> {
   if (typeof schema !== 'object' || schema === null) {
      return false;
   }
   const s = schema as any;
   return (
      OBJECT_TYPES.has(s.type) &&
      typeof s.entries === 'object' &&
      s.entries !== null
   );
}

/**
 * Extracts the keys of all fields containing an array from a Valibot object schema.
 */
export function extractArrayFields(
   schema: unknown,
   options?: { EXCEPTIONS?: string[] }
): string[] {
   // 1. Validate the input schema directly.
   if (!isValibotObjectSchema(schema)) {
      throw new Error(
         'Invalid argument: Input is not a Valibot object schema.'
      );
   }

   // 2. Caching is disabled when EXCEPTIONS are used to ensure the
   // correct result is always returned for different exception lists.
   // A more complex cache key could be created if performance is critical.
   if (!options?.EXCEPTIONS && _memoizedArrayFieldMap.has(schema)) {
      return _memoizedArrayFieldMap.get(schema)!;
   }

   const arrayFieldKeys: string[] = [];
   const visited = new Set<any>();

   // The recursive helper remains the same as it was already correct.
   const isOrContainsArray = (fieldSchema: any): boolean => {
      if (!fieldSchema || typeof fieldSchema !== 'object') {
         return false;
      }
      if (visited.has(fieldSchema)) {
         return false;
      }
      visited.add(fieldSchema);

      if (fieldSchema.type === 'array' || fieldSchema.type === 'array_async') {
         return true;
      }
      if ('wrapped' in fieldSchema) {
         return isOrContainsArray(fieldSchema.wrapped);
      }

      const subSchemas: any[] = [];

      const props: ('pipe' | 'options' | 'entries' | 'items')[] = [
         'pipe',
         'options',
         'entries',
         'items',
      ];

      for (const prop of props) {
         if (prop in fieldSchema && Array.isArray(fieldSchema[prop])) {
            subSchemas.push(...fieldSchema[prop]);
         }
      }

      if (subSchemas.length > 0) {
         return subSchemas.some(isOrContainsArray);
      }

      return false;
   };

   // 3. Iterate over the schema's entries.
   for (const [key, fieldSchema] of Object.entries(schema.entries)) {
      if (isOrContainsArray(fieldSchema)) {
         arrayFieldKeys.push(key);
      }
   }

   // 4. Filter out any EXCEPTIONS provided in the options

   const finalKeys = arrayFieldKeys.filter(
      key => !options?.EXCEPTIONS?.includes(key)
   );

   if (!options?.EXCEPTIONS) {
      _memoizedArrayFieldMap.set(schema, finalKeys);
   }

   return finalKeys;
}
