import mongoose from "mongoose";

const ScheduleProgressShema = new mongoose.Schema({
    userEmail: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true 
    },
    targetAmount: {
        type: Number,
        required: true
    },
    categories: [{
        name: { 
            type: String,
            required: true 
        },
        limit: { 
            type: Number,
            required: true 
        }    
    }],
    day:{
        type: Number, 
        required: true 
    },
    month: { 
        type: Number, 
        required: true 
    },
    week:{
        type: Number, 
        required: true
    },
    year: { 
        type: Number, 
        required: true 
    },
    totalSpent: { 
        type: Number, 
        default: 0 
    },
    categorySpent: {
        type: Map,
        of: Number,
        default: {} 
    }

},{
    timestamps: true
});

const ScheduleProgress = mongoose.model('scheduleProgress',ScheduleProgressShema);

export default ScheduleProgress;