import express from 'express';
import { getProgressByDate, getScheduleProgressesByUser } from '../controllers/scheduleProgressController.js';

const scheduleProgressRouter = express.Router();

scheduleProgressRouter.get('/',getScheduleProgressesByUser);

scheduleProgressRouter.get('/all-types', getProgressByDate);

export default scheduleProgressRouter;