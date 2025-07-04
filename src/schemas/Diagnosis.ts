import {
   strictObject,
   pipe,
   string,
   minLength,
   literal,
   InferOutput,
} from 'valibot';

export const CreateDiagnosisVSchema = strictObject({
   kind: literal('diagnosis'),
   name: pipe(string(), minLength(1, 'Diagnosis name is required (Valibot)')),
   description: pipe(
      string(),
      minLength(1, 'Diagnosis description is required (Valibot)')
   ),
});

export type CreateDiagnosisOutput = InferOutput<typeof CreateDiagnosisVSchema>;
