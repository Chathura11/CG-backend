import mongoose from "mongoose";

const ScheduleShema =new mongoose.Schema({
    userEmail:{
        type:String,
        required:true,
        lowercase: true,
        trim: true
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
    remindersEnabled: {
        type: Boolean,
        default: false
    },
    isEnabled:{
        type:Boolean,
        default:true
    }

}, {
    timestamps: true
})

const Schedule = mongoose.model('schedule',ScheduleShema);

export default Schedule;