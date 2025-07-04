import {
   strictObject,
   literal,
   pipe,
   string,
   minLength,
   InferOutput,
} from 'valibot';

export const CreateVaccineVSchema = strictObject({
   kind: literal('vaccine'),
   name: pipe(string(), minLength(1, 'Vaccine name is required (Valibot)')),
   purpose: pipe(
      string(),
      minLength(1, 'Vaccine purpose is required (Valibot)')
   ),
});

export type CreateVaccineOutput = InferOutput<typeof CreateVaccineVSchema>;
