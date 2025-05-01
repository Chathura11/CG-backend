import express from 'express';
import { getProgressByDate, getScheduleProgressesByUser } from '../controllers/scheduleProgressController.js';

const scheduleProgressRouter = express.Router();

scheduleProgressRouter.get('/:userEmail',getScheduleProgressesByUser);

scheduleProgressRouter.get('/all-types/:userEmail', getProgressByDate);

export default scheduleProgressRouter;