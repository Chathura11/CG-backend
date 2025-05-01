import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    currency: {
        type: String,
        default: 'LKR'
    },
    bankLinkEnabled: {
        type: Boolean,
        default: false
    },
    notificationFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
    }

});

const Setting = mongoose.model('setting',SettingsSchema);

export default Setting;