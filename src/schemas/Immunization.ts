import {
   pipe,
   strictObjectAsync,
   string,
   unionAsync,
   optional,
   never,
   nullable,
   minLength,
   optionalAsync,
   InferOutput,
} from 'valibot';
import { VaccineModel } from '@models/Vaccine';
import { DoctorModel } from '@models/Doctor';
import { ValidTypedModelReference } from '@utils/validModelReference';
import { validateDateField } from '@utils/validateDateField';

const ValidDoctorReference = ValidTypedModelReference(DoctorModel, 'doctor');

export const AdministeredByVSchema = unionAsync([
   strictObjectAsync({
      doctorId: ValidDoctorReference,
      externalName: optional(never()),
   }),
   strictObjectAsync({
      doctorId: optional(never()),
      externalName: pipe(
         string(),
         minLength(1, 'External name is required (Valibot)')
      ),
   }),
]);

export type AdministeredByOutput = InferOutput<typeof AdministeredByVSchema>;

const ValidVaccineReference = ValidTypedModelReference(VaccineModel, 'vaccine');

export const CreateImmunizationVSchema = strictObjectAsync({
   vaccine: ValidVaccineReference,
   dateAdministered: validateDateField('Date administered'),
   nextDoseDue: optional(nullable(validateDateField('Next dose due'))),
   administeredBy: optionalAsync(AdministeredByVSchema),
   notes: optional(string()),
});

export type CreateImmunizationOutput = InferOutput<
   typeof CreateImmunizationVSchema
>;
