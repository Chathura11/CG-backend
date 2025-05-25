import express from 'express';
import { FinancialAssistant } from '../controllers/aiController.js';

const aiRouter = express.Router();

aiRouter.post('/financial-assistant',FinancialAssistant);

export default aiRouter;