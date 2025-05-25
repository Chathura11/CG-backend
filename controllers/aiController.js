import Expense from '../models/expense.js';
import Schedule from '../models/schedule.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function FinancialAssistant(req, res) {
  try {
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized!" });
    }

    const userEmail = req.user.email;
    const { question } = req.body;

    const schedule = await Schedule.findOne({ userEmail, type: 'monthly' });
    const monthlyIncome = schedule?.targetAmount || 0;

    // Get all expenses in the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const rawExpenses = await Expense.find({
      userEmail,
      date: { $gte: threeMonthsAgo }
    });

    if (rawExpenses.length === 0) {
      return res.status(400).json({ message: "Not enough expense data to generate advice." });
    }

    // Determine how many unique months of data we have
    const uniqueMonths = new Set(
      rawExpenses.map((exp) => `${exp.date.getFullYear()}-${exp.date.getMonth() + 1}`)
    );

    const numMonths = uniqueMonths.size;

    // Group expenses by category and sum amounts
    const categorySums = {};
    for (const exp of rawExpenses) {
      const cat = exp.category;
      categorySums[cat] = (categorySums[cat] || 0) + exp.amount;
    }

    const categoryBreakdown = Object.entries(categorySums).map(([name, total]) => ({
      name,
      monthlyAverage: Math.round(total / numMonths)
    }));

    const spendingSummary = categoryBreakdown
      .map((c) => `${c.name}: ${c.monthlyAverage} LKR`)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    A user wants financial advice based on their spending habits and income.

    User's question: "${question}"
    Monthly income: ${monthlyIncome} LKR

    Their average monthly spending across ${numMonths} month(s):
    ${spendingSummary}

    Generate a personalized response that includes:
    - How much they should save monthly to reach their goal
    - Which categories to cut and by how much
    - Practical saving tips
    - A motivational message
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ advice: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ message: "AI processing failed", error });
  }
}
