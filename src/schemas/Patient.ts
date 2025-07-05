import {
   string,
   arrayAsync,
   picklist,
   optional,
   optionalAsync,
   pipe,
   pipeAsync,
   unionAsync,
   literal,
   minLength,
   email,
   InferOutput,
   strictObjectAsync,
   boolean,
   transform,
   fallback,
   fallbackAsync,
} from 'valibot';

import { BLOOD_TYPES } from '@lib/constants';
import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { ValidateDOB } from '@lib/age';
import { AddressVSchema } from '@schemas/Address';
import { GenderVSchema } from '@schemas/Gender';
import { CreateAllergyCaseVSchema } from '@schemas/AllergyCase';
import { CreateImmunizationVSchema } from '@schemas/Immunization';
import { CreateMedicalCaseVSchema } from '@schemas/MedicalCase';
import { CreateEmergencyContactVSchema } from '@schemas/EmergencyContact';
import { ValidTypedModelReference } from '@utils/validModelReference';
import { DoctorModel } from '@models/Doctor';

const PreferredDoctorVSchema = unionAsync(
   [ValidTypedModelReference(DoctorModel, 'doctor'), literal('unspecified')],
   'Preferred doctor must be a valid doctor ID or "unspecified".'
);

export const CreateClinicalFormVSchema = strictObjectAsync({
   bloodType: fallback(picklist(Object.values(BLOOD_TYPES)), 'unknown'),
   allergies: fallbackAsync(arrayAsync(CreateAllergyCaseVSchema), []),
   immunizations: fallbackAsync(arrayAsync(CreateImmunizationVSchema), []),
   medicalHistory: fallbackAsync(arrayAsync(CreateMedicalCaseVSchema), []),
   emergencyContacts: fallbackAsync(
      arrayAsync(CreateEmergencyContactVSchema),
      []
   ),
});

export const ClinicalFieldVSchema = pipeAsync(
   CreateClinicalFormVSchema,
   transform(
      value =>
         value ?? {
            bloodType: 'unknown',
            allergies: [],
            immunizations: [],
            medicalHistory: [],
            emergencyContacts: [],
         }
   )
);

export const CreatePatientVSchema = strictObjectAsync({
   firstName: pipe(string(), minLength(1, 'First name is required (Valibot)')),
   lastName: pipe(string(), minLength(1, 'Last name is required (Valibot)')),
   gender: GenderVSchema,
   dateOfBirth: ValidateDOB,
   phone: ValidatePhone,
   email: optional(pipe(string(), email())),
   address: AddressVSchema,
   doctor: PreferredDoctorVSchema,
   clinical: ClinicalFieldVSchema,
   verified: boolean('Boolean is required (Valibot)'),
});

export type CreateClinicalFormOutput = InferOutput<
   typeof CreateClinicalFormVSchema
>;

export type CreatePatientOutput = InferOutput<typeof CreatePatientVSchema>;
