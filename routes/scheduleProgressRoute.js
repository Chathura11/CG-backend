import express from 'express';
import { getCurrentScheduleProgress, getProgressByDate, getScheduleProgressesByUser } from '../controllers/scheduleProgressController.js';

const scheduleProgressRouter = express.Router();

scheduleProgressRouter.get('/',getScheduleProgressesByUser);

scheduleProgressRouter.get('/current',getCurrentScheduleProgress);

scheduleProgressRouter.get('/all-types', getProgressByDate);

export default scheduleProgressRouter;