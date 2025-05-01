import Schedule from '../models/schedule.js';
import Expense from '../models/expense.js';
import ScheduleProgress from '../models/scheduleProgress.js';

function getPeriodInfo(date, type) {
  const d = new Date(date);
  return {
    day: d.getDate(),
    week: Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7),
    month: d.getMonth() + 1,
    year: d.getFullYear()
  }[type];
}

function matchDateFilter(type, dateObj) {
  const { day, week, month, year } = dateObj;

  switch (type) {
    case 'daily':
      return {
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: "$date" }, day] },
            { $eq: [{ $month: "$date" }, month] },
            { $eq: [{ $year: "$date" }, year] }
          ]
        }
      };
    case 'weekly':
      return {
        $expr: {
          $and: [
            { $eq: [{ $week: "$date" }, week] },
            { $eq: [{ $year: "$date" }, year] }
          ]
        }
      };
    case 'monthly':
      return {
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, month] },
            { $eq: [{ $year: "$date" }, year] }
          ]
        }
      };
    case 'yearly':
      return {
        $expr: {
          $eq: [{ $year: "$date" }, year]
        }
      };
  }
}

async function recalculateScheduleProgress(userEmail, type, date){
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const week = Math.ceil((day + new Date(year, month - 1, 1).getDay()) / 7);

  // Get the active schedule of that type
  const schedule = await Schedule.findOne({ userEmail, type, isEnabled: true });
  if (!schedule) return; // No schedule = nothing to do

  const dateFilter = matchDateFilter(type, { day, week, month, year });

  // Get expenses for the user and period
  const expenses = await Expense.find({ userEmail, ...dateFilter });

  // Calculate totals
  let totalSpent = 0;
  const categorySpent = {};

  expenses.forEach(exp => {
    totalSpent += exp.amount;
    categorySpent[exp.category] = (categorySpent[exp.category] || 0) + exp.amount;
  });

  // Update or create progress
  const existing = await ScheduleProgress.findOneAndUpdate(
    { userEmail, type, day, month, year },
    {
      userEmail,
      type,
      targetAmount: schedule.targetAmount,
      categories: schedule.categories,
      totalSpent,
      categorySpent,
      day,
      month,
      year
    },
    { upsert: true, new: true }
  );

  return existing;
};

export default recalculateScheduleProgress;
