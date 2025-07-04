import { safeParseAsync } from 'valibot';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { BaseSchemaAsync, BaseIssue } from 'valibot';
import { ValidationError as CustomValidationError } from '@errors/ValidationError';

/* export function validateBody<T, TInput = unknown>(
   schema: BaseSchemaAsync<T, any, BaseIssue<TInput>>
): RequestHandler {
   return async (req: Request, res: Response, next: NextFunction) => {
      const result = await safeParseAsync(schema, req.body);

      if (!result.success) {
         return next(new CustomValidationError(result.issues));
      }

      req.body = result.output;
      next();
   };
} */

export function validateBody<T, TInput = unknown>(
   schema: BaseSchemaAsync<T, any, BaseIssue<TInput>>
): RequestHandler {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         const result = await safeParseAsync(schema, req.body);
         if (!result.success) {
            return next(new CustomValidationError(result.issues));
         }
         // 🔐 Write to a protected, isolated location
         res.locals.validatedInput = result.output;
         // Optional: freeze the validated payload to catch future mutation attempts
         Object.freeze(res.locals.validatedInput);
         next();
      } catch (err) {
         next(err);
      }
   };
}
