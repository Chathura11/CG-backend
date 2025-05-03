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

export default async function recalculateScheduleProgress(userEmail, type, date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const week = Math.ceil((day + new Date(year, month - 1, 1).getDay()) / 7);

  const schedule = await Schedule.findOne({ userEmail, type, isEnabled: true });
  if (!schedule) return;

  const dateFilter = matchDateFilter(type, { day, week, month, year });
  const expenses = await Expense.find({ userEmail, ...dateFilter });

  let totalSpent = 0;
  const categorySpent = {};

  expenses.forEach(exp => {
    totalSpent += exp.amount;
    categorySpent[exp.category] = (categorySpent[exp.category] || 0) + exp.amount;
  });

  const query = { userEmail, type, year };
  if (type === "daily") {
    query.day = day;
    query.month = month;
  } else if (type === "weekly") {
    query.week = week;
    query.month = month;
  } else if (type === "monthly") {
    query.month = month;
  }

  const update = {
    userEmail,
    type,
    targetAmount: schedule.targetAmount,
    categories: schedule.categories,
    totalSpent,
    categorySpent,
    ...(type === "daily" && { day, month }),
    ...(type === "weekly" && { week, month }),
    ...(type === "monthly" && { month }),
    year
  };

  const existing = await ScheduleProgress.findOneAndUpdate(query, update, {
    upsert: true,
    new: true
  });

  return existing;
}

