import express from 'express';
import { createSchedule, deleteSchedule, getSchedulesByUser, toggleScheduleStatus, updateSchedule } from '../controllers/scheduleController.js';

const scheduleRouter = express.Router();

scheduleRouter.post('/', createSchedule);

scheduleRouter.get('/', getSchedulesByUser);

scheduleRouter.put('/:id', updateSchedule);

scheduleRouter.delete('/:id', deleteSchedule);

scheduleRouter.patch('/:id/toggle', toggleScheduleStatus);


export default scheduleRouter;