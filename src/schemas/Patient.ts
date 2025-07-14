import {
   string,
   trim,
   arrayAsync,
   picklist,
   optional,
   pipe,
   pipeAsync,
   unionAsync,
   literal,
   minLength,
   email,
   InferOutput,
   strictObjectAsync,
   boolean,
   fallback,
   fallbackAsync,
   maxLength,
} from 'valibot';

import { BLOOD_TYPES, EMBEDDED_ARRAY_FIELDS } from '@lib/constants';
import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { ValidateDOB } from '@lib/age';
import { AddressVSchema } from '@schemas/Address';
import { GenderVSchema } from '@schemas/Gender';
import { CreateAllergyCaseVSchema } from '@schemas/AllergyCase';
import { CreateImmunizationVSchema } from '@schemas/Immunization';
import { CreateMedicalCaseVSchema } from '@schemas/MedicalCase';
import { CreateEmergencyContactVSchema } from '@schemas/EmergencyContact';
import { ValidTypedModelReference } from '@utils/validModelReference';
import { extractArrayFields } from '@utils/extractArrayFields';
import { TypeSafeArrayKeys } from '@utils/validateArrayKeys';
import { DoctorModel } from '@models/Doctor';

const PreferredDoctorVSchema = unionAsync(
   [ValidTypedModelReference(DoctorModel, 'doctor'), literal('unspecified')],
   'Preferred doctor must be a valid doctor ID or "unspecified".'
);

export const CreatePatientVSchema = strictObjectAsync({
   kind: literal('patient'),
   firstName: pipe(
      string(),
      trim(),
      minLength(1, 'First name is required (Valibot)')
   ),
   lastName: pipe(
      string(),
      trim(),
      minLength(1, 'Last name is required (Valibot)')
   ),
   gender: GenderVSchema,
   dateOfBirth: ValidateDOB,
   phone: ValidatePhone,
   email: optional(pipe(string(), trim(), email())),
   address: AddressVSchema,
   doctor: PreferredDoctorVSchema,

   bloodType: fallback(picklist(Object.values(BLOOD_TYPES)), 'unknown'),
   allergies: fallbackAsync(arrayAsync(CreateAllergyCaseVSchema), []),
   immunizations: fallbackAsync(arrayAsync(CreateImmunizationVSchema), []),
   medicalHistory: fallbackAsync(arrayAsync(CreateMedicalCaseVSchema), []),
   emergencyContacts: fallbackAsync(
      pipeAsync(
         arrayAsync(CreateEmergencyContactVSchema),
         maxLength(3, 'The Emergency Contacts array must not exceed 3 elements')
      ),
      []
   ),
   verified: boolean('Boolean is required (Valibot)'),
});

export const patientArrayKeys: actualPatientArrayKeys[] = [
   'allergies',
   'immunizations',
   'medicalHistory',
];

type actualPatientArrayKeys = TypeSafeArrayKeys<CreatePatientOutput>;
export type CreatePatientOutput = InferOutput<typeof CreatePatientVSchema>;
