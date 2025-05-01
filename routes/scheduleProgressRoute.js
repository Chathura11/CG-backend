import express from 'express';
import { getScheduleProgressesByUser } from '../controllers/scheduleProgressController.js';

const scheduleProgressRouter = express.Router();

scheduleProgressRouter.get('/:userEmail',getScheduleProgressesByUser)

export default scheduleProgressRouter;