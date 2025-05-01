import express from 'express'
import { addExpenseAndUpdateProgress, deleteExpenseAndUpdateProgress, editExpenseAndRecalculateProgress, getExpensesByUser } from '../controllers/expenseController.js';

const expenseRouter = express.Router();

expenseRouter.post('/',addExpenseAndUpdateProgress);

expenseRouter.put('/:id', editExpenseAndRecalculateProgress);

expenseRouter.delete('/:id', deleteExpenseAndUpdateProgress);

expenseRouter.get('/:userEmail',getExpensesByUser);

export default expenseRouter;