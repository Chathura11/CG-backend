import mongoose from "mongoose";


const UserSchema =new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true
    },
    password:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Boolean,
        required:true,
        default:false
    },
    role:{
        type:String,
        required:true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    firstname:{
        type:String,
        required:true,
        trim: true
    },
    lastname:{
        type:String,
        required:true,
        trim: true
    },
    address:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        trim: true
    },
    profilePicture:{
        type:String,
        required:true,
        default:"https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png"
    },
    emailVerified:{
        type:Boolean,
        required:true,
        default:false
    }

},{
    timestamps: true 
});


const User = mongoose.model("user",UserSchema);

export default User;