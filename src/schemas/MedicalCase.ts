import {
   string,
   strictObjectAsync,
   array,
   maxValue,
   picklist,
   optional,
   pipe,
   minLength,
   InferOutput,
} from 'valibot';
import { SEVERITIES } from '@lib/constants';
import { DiagnosisModel } from '@models/Diagnosis';
import { DoctorModel } from '@models/Doctor';
import { ValidTypedModelReference } from '@utils/validModelReference';
import { validateDateField } from '@utils/validateDateField';

const ValidDiagnosisReference = ValidTypedModelReference(
   DiagnosisModel,
   'diagnosis'
);

const ValidDoctorReference = ValidTypedModelReference(DoctorModel, 'doctor');

export const CreateMedicalCaseVSchema = strictObjectAsync({
   diagnosis: ValidDiagnosisReference,
   condition: pipe(string(), minLength(1, 'Condition is required (Valibot)')),
   severity: picklist(Object.values(SEVERITIES)),
   startDate: pipe(validateDateField('Start date'), maxValue(new Date())),
   endDate: optional(pipe(validateDateField('End date'), maxValue(new Date()))),
   diagnosedBy: ValidDoctorReference,
   treatment: optional(string()),
   relatedConditions: optional(array(string())),
   notes: optional(string()),
});

export type CreateMedicalCaseOutput = InferOutput<
   typeof CreateMedicalCaseVSchema
>;
