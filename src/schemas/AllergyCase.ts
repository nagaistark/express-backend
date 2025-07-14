import {
   strictObjectAsync,
   optional,
   picklist,
   string,
   trim,
   pipe,
   minLength,
   InferOutput,
} from 'valibot';
import { SEVERITIES } from '@lib/constants';
import { AllergenModel } from '@models/Allergen';
import { ValidTypedModelReference } from '@utils/validModelReference';
import { validateDateField } from '@utils/validateDateField';
import { PatientModel } from '@models/Patient';

const ValidAllergenReference = ValidTypedModelReference(
   AllergenModel,
   'allergen'
);

export const CreateAllergyCaseVSchema = strictObjectAsync({
   substance: ValidAllergenReference,
   reaction: pipe(string(), minLength(1, 'Reaction is required (Valibot)')),
   severity: picklist(Object.values(SEVERITIES)),
   diagnosedDate: optional(validateDateField('Date diagnosed')),
   treatment: optional(string()),
   notes: optional(string()),
});
