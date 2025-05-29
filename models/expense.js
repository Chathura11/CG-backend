import mongoose from "mongoose";

const ExpensesSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description:{
        type:String,
        required:false
    },
    receiptImageUrl: {
        type: String,
        required:false
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('expense',ExpensesSchema);

export default Expense;