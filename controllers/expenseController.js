import Expense from "../models/expense.js";
import Schedule from "../models/schedule.js";
import ScheduleProgress from "../models/scheduleProgress.js";
import recalculateScheduleProgress from "./recalculateScheduleProgress.js";


export async function addExpenseAndUpdateProgress(req,res){
    try {

        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const {  category, amount,date, receiptImageUrl } = req.body;
        const userEmail = req.user.email;
        const expenseDate = new Date(date || Date.now());
        const day = expenseDate.getDate();
        const month = expenseDate.getMonth() + 1;
        const year = expenseDate.getFullYear();

        //save the expense record
        const expense = new Expense({
            userEmail,
            category,
            amount,
            date:expenseDate,
            receiptImageUrl
        })

        await expense.save();

        //fetch all active schedules for the user
        const schedules = await Schedule.find({userEmail:userEmail,isEnabled:true})

        for (const schedule of schedules) {

            const query = {
              userEmail,
              type: schedule.type,
              year
            };

            const insert = {
              userEmail,
              type: schedule.type,
              year,
              targetAmount: schedule.targetAmount,
              categories: schedule.categories
            };
      
            if (schedule.type === 'daily') {
                query.day = day;
                query.month = month;
                insert.day = day;
                insert.month = month;

            } else if (schedule.type === 'weekly') {
                const weekOfMonth = getWeekOfMonth(expenseDate);
                query.month = month;
                query.week = weekOfMonth;
                insert.month = month;
                insert.week = weekOfMonth;
                
            } else if (schedule.type === 'monthly') {
                query.month = month;
                insert.month = month;

            } else if (schedule.type === 'yearly') {
                query.year = year;
                insert.year = year;
            }
      
            // 3. Upsert into ScheduleProgress
            await ScheduleProgress.findOneAndUpdate(
              query,
              {
                $inc: {
                  totalSpent: amount,
                  [`categorySpent.${category}`]: amount
                },
                $setOnInsert: insert
              },
              { upsert: true, new: true }
            );
        }
        res.status(200).json({ message: 'Expense logged and schedule progress updated.', expense });

    } catch (error) {
        res.status(500).json({message:"Internal server error!"});
    }
}

export async function getExpensesByUser(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const  userEmail  = req.user.email;
        const expenses = await Expense.find({ userEmail }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get expenses' });
    }
};

export async function getMonthlyExpensesByUser(req, res) {
    try {
        if (!req.user) {
            return res.status(403).json({ message: "Unauthorized!" });
        }
  
        const  userEmail = req.user.email;
  
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
        const expenses = await Expense.find({
            userEmail,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: -1 });
  
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get monthly expenses' });
    }
}

export async function getExpensesByMonthAndYear(req, res) {
    try {
        if (!req.user) {
            return res.status(403).json({ message: "Unauthorized!" });
        }
  
        const userEmail = req.user.email;
        const { month, year } = req.body;
  
        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required." });
        }
  
        const numericMonth = parseInt(month) - 1; // JavaScript Date months are 0-indexed
        const numericYear = parseInt(year);
  
        const startOfMonth = new Date(numericYear, numericMonth, 1);
        const endOfMonth = new Date(numericYear, numericMonth + 1, 0, 23, 59, 59, 999);
  
        const expenses = await Expense.find({
            userEmail,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: -1 });
  
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get expenses for the given month and year.' });
    }
}

export async function editExpenseAndRecalculateProgress(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { id } = req.params;
        const updatedExpenseData = req.body;
  
        // 1. Get old expense
        const oldExpense = await Expense.findById(id);
        if (!oldExpense) return res.status(404).json({ error: 'Expense not found' });
  
        // 2. Update the expense
        const updatedExpense = await Expense.findByIdAndUpdate(id, updatedExpenseData, { new: true });
  
        // 3. Recalculate all related ScheduleProgress
        const progressTypes = ['daily', 'weekly', 'monthly', 'yearly'];
        for (const type of progressTypes) {
            await recalculateScheduleProgress(oldExpense.userEmail, type, oldExpense.date);
        }
  
        res.status(200).json({ message: 'Expense updated and progress recalculated', expense: updatedExpense });
    } catch (err) {
        res.status(500).json({ message: 'Failed to edit expense' });
    }
};


export async function deleteExpenseAndUpdateProgress(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { id } = req.params;
  
        // 1. Get the expense to delete
        const expense = await Expense.findById(id);
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
  
        // 2. Delete it
        await Expense.findByIdAndDelete(id);
  
        // 3. Recalculate progress after deletion
        const progressTypes = ['daily', 'weekly', 'monthly', 'yearly'];
        for (const type of progressTypes) {
            await recalculateScheduleProgress(expense.userEmail, type, expense.date);
        }
  
        res.status(200).json({ message: 'Expense deleted and progress updated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete expense' });
    }
  };

function getWeekOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const dayOfWeek = startOfMonth.getDay();

    return Math.ceil((dayOfMonth + dayOfWeek) / 7);
}