import mongoose from 'mongoose';

import { Router } from 'express';
import { PatientModel } from '@models/Patient';
import { IPatient } from '@mytypes/Patient';

import { deleteById, deleteAll } from '@controllers/common/deleteController';
import { getById, getAll } from '@controllers/common/readController';
import { createOne, createMany } from '@controllers/common/createController';
import { updateById, updateMany } from '@controllers/common/updateController';

import { validateBody } from '@middleware/validateBody';
import { CreatePatientVSchema } from '@schemas/Patient';
import { ensureClinicalDefault } from '@middleware/ensureClinical';
import { ensurePreferredDoctorDefault } from '@middleware/ensurePreferredDoctorDefault';

const router = Router();

router.get('/:id', getById<IPatient>(PatientModel));
// router.get('/', getAll<IPatient>('patients'));

// Test Route to inspect the `req.query` object
router.get('/', (req, res) => {
   console.log(`Query: ${req.query}`);
   res.send('Check console');
});

// Test Route to time the query
/* router.get('/test-native', async (req, res) => {
   try {
      console.time('NativeQuery');
      const result = await mongoose.connection.db
         ?.collection('patients')
         .find({})
         .toArray();
      console.timeEnd('NativeQuery');
      res.status(200).json(result);
   } catch (err) {
      res.status(500).json({ error: 'fail' });
   }
}); */

router.post(
   '/',
   ensurePreferredDoctorDefault, // 🛠 Mutates req.body if doctor is missing
   ensureClinicalDefault, // 🛠 Mutates req.body if clinical is missing
   validateBody(CreatePatientVSchema), // ✅ Parses and sanitizes input → res.locals.validatedInput (immutable)
   createOne<IPatient>(PatientModel) // 🎯 Uses res.locals.validatedInput to save to DB
);
router.post('/many', createMany<IPatient>(PatientModel));

router.patch('/:id', updateById<IPatient>(PatientModel));
router.patch('/', updateMany<IPatient>(PatientModel));

router.delete('/:id', deleteById<IPatient>(PatientModel));
router.delete('/', deleteAll<IPatient>(PatientModel));

export default router;
