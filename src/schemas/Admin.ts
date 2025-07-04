import {
   string,
   optional,
   pipe,
   minLength,
   email,
   InferOutput,
   literal,
   strictObjectAsync,
} from 'valibot';

import { ValidatePhone } from '@validators/valibot/ValidatePhone';
import { ValidateDOB } from '@lib/age';
import { AddressVSchema } from '@schemas/Address';
import { GenderVSchema } from '@schemas/Gender';

export const CreateAdminVSchema = strictObjectAsync({
   kind: literal('admin'),
   firstName: pipe(string(), minLength(1, 'First name is required (Valibot)')),
   lastName: pipe(string(), minLength(1, 'Last name is required (Valibot)')),
   gender: GenderVSchema,
   dateOfBirth: ValidateDOB,
   phone: ValidatePhone,
   email: optional(pipe(string(), email())),
   address: AddressVSchema,
   role: pipe(string(), minLength(1, 'Role is required (Valibot)')),
});

export type CreateAdminOutput = InferOutput<typeof CreateAdminVSchema>;
