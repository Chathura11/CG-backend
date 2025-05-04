import express from 'express'
import { addExpenseAndUpdateProgress, deleteExpenseAndUpdateProgress, editExpenseAndRecalculateProgress, getExpensesByMonthAndYear, getExpensesByUser, getMonthlyExpensesByUser } from '../controllers/expenseController.js';

const expenseRouter = express.Router();

expenseRouter.post('/',addExpenseAndUpdateProgress);

expenseRouter.put('/:id', editExpenseAndRecalculateProgress);

expenseRouter.delete('/:id', deleteExpenseAndUpdateProgress);

expenseRouter.get('/',getExpensesByUser);

expenseRouter.get('/monthly', getMonthlyExpensesByUser);

expenseRouter.post('/by-month', getExpensesByMonthAndYear);

export default expenseRouter;