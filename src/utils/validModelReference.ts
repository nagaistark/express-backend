import { pipeAsync, customAsync, string } from 'valibot';
import { isValidObjectId, Model } from 'mongoose';

// Make sure that `ObjectId` belongs to the right Model (when being referenced in a parent schema)
export function ValidTypedModelReference<T extends { kind: string }>(
   model: Model<T>,
   kind: T['kind'],
   modelName = model.modelName
) {
   return pipeAsync(
      string(),
      customAsync(async val => {
         if (typeof val !== 'string') {
            console.warn(`[${modelName}] Validation failed: not a string.`, {
               val,
            });
            return false;
         }
         if (!isValidObjectId(val)) {
            console.warn(
               `[${modelName}] Validation failed: invalid ObjectId.`,
               { val }
            );
            return false;
         }
         try {
            const exists = await model.exists({ _id: val, kind });
            return !!exists;
         } catch (err) {
            console.error(
               `[${modelName}] Error during model reference validation:`,
               err
            );
            return false;
         }
      }, `Invalid ${modelName} reference — must exist and be of kind "${kind}"`)
   );
}
