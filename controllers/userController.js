import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import axios from 'axios'
import nodemailer from 'nodemailer';
import OTP from "../models/otp.js";

const transport = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:"chathuraasela11@gmail.com",
        pass:"srpqymnpsgrrhnyy"
    }
})

export function userRegister(req,res){
    const newUser = req.body

    const user = new User(newUser);

    user.password = bcrypt.hashSync(user.password,10);

    user.save().then(()=>{
        res.status(200).json({message:"user successfully saved!"})
    }).catch((error)=>{
        res.status(500).json({message:error})
    })
}

export function loginUser(req,res){
    const data = req.body;

    User.findOne({
        email:data.email
    }).then((user)=>{
        if(user == null){
            res.status(404).json({message:"user not found"})
        }else{
            if(user.isBlocked){
                res.status(403).json({message:"Your account is blocked.Please contact the admin!"})
                return;
            }

            const isPasswordCorrect = bcrypt.compareSync(data.password,user.password);

            if(isPasswordCorrect){
                const token = jwt.sign({
                    firstname : user.firstname,
                    lastname : user.lastname,
                    email:user.email,
                    role:user.role,
                    profilePicture:user.profilePicture,
                    phone:user.phone,
                    emailVerified:user.emailVerified
                },process.env.JWT_SECRET_KEY,{ expiresIn: 60 * 60 * 24 * 7 })

                res.status(200).json({message:"login successful!",token:token,user:user})
            }else{
                res.status(401).json({message:"login failed!"})
            }
        }
    })
}

export async function UpdateUser(req,res){

    const email = req.params.email;

    if(req.user == null){
        return res.status(403).json({message:"Unauthorized!"});
    }

    const data = req.body;

    try {
        const user = await User.findOne({email:email})

        if(user ==null){
            res.status(404).json({message:"User not found"})
        }else{
            if(user.isBlocked){
                res.status(403).json({message:"Your account is blocked.Please contact the admin!"})
                return;
            }

            let newData={
                password : user.password,
                firstname: data.firstname,
                lastname :data.lastname,
                address : data.address,
                phone : data.phone,
                profilePicture : data.profilePicture,           
            }

            if (data.password && data.newPassword) {
                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);
                if (isPasswordCorrect) {
                    newData.password = bcrypt.hashSync(data.newPassword, 10);
                } else {
                    return res.status(404).json({message:"Invalid password!"});
                }
            }       
         
            await User.updateOne({email:email},newData);

            res.status(200).json({message:"User updated successfully!"});

        }

    } catch (error) {
        res.status(500).json({message:"Failed to update user!"})
    }
}

export function isItAdmin(req){
    let isAdmin = false;
    
    if(req.user !=null){
        if(req.user.role == "admin"){
            isAdmin = true;
        }
    }

    return isAdmin;
}

export function isItUser(req){
    let isUser = false;

    if(req.user !=null){
        if(req.user.role == "user"){
            isUser = true;
        }
    }

    return isUser;
}

export async function GetAllUsers(req,res){
    if(isItAdmin(req)){
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({message:"Failed to get users"})
        }

    }else{
        res.status(403).json({message:"Unauthrized!"})
    }
}

export async function BlockOrUnblockUser(req,res){
    const email = req.params.email;
    if(isItAdmin(req)){
        try {
            const user = await User.findOne({email:email});

            if(user == null){
                res.status(404).json({message:"User not found!"});
                return;
            }

            const isBlocked = !user.isBlocked;

            await User.updateOne({email:email},{isBlocked:isBlocked});

            res.status(200).json({message:"User Blocked/Unblocked successfully!"});
        } catch (error) {
            res.status(500).json({message:"Failed to get user!"});
        }
    }else{
        res.status(403).json({message:"Unauthorized!"});
    }
    
}

export async function GetUser(req,res){
    if(req.user != null){

        try {
            const user = await User.findOne({email:req.user.email});

            const userData ={
                email : user.email,
                isBlocked:user.isBlocked,
                role:user.role,
                firstname:user.firstname,
                lastname:user.lastname,
                address:user.address,
                phone:user.phone,
                profilePicture:user.profilePicture,
                emailVerified:user.emailVerified
            }

            res.status(200).json(userData);

        } catch (error) {
            res.status(500).json({message:'Failed to load user!'})
        }
    }else{
        res.status(403).json({message:"Unauthorized!"});
    }
}

export async function LoginWithGoogle(req,res){
    const accessToken = req.body.accessToken;

    try {
        const response =await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
            headers:{
                Authorization:`Bearer ${accessToken}`
            }
        })
        const user = await User.findOne({email:response.data.email})

        if(user !=null){
            if(user.isBlocked){
                res.status(403).json({message:"Your account is blocked.Please contact the admin!"})
                return;
            }
            
            const token = jwt.sign({
                firstname : user.firstname,
                lastname : user.lastname,
                email:user.email,
                role:user.role,
                profilePicture:user.profilePicture,
                phone:user.phone,
                emailVerified:true
            },process.env.JWT_SECRET_KEY)

            res.status(200).json({message:"login successful!",token:token,user:user})
        }else{
            const newUser = new User({
                email: response.data.email,
                password : "123",
                firstname:response.data.given_name,
                lastname:response.data.family_name,
                address:"Not Given",
                phone:"Not Given",
                profilePicture:response.data.picture,
                emailVerified:true

            })

            const savedUser =await newUser.save();

            const token = jwt.sign({
                firstname : savedUser.firstname,
                lastname : savedUser.lastname,
                email:savedUser.email,
                role:savedUser.role,
                profilePicture:savedUser.profilePicture,
                phone:savedUser.phone
            },process.env.JWT_SECRET_KEY)

            res.status(200).json({message:"login successful!",token:token,user:savedUser})
        }

    } catch (error) {
        res.status(500).json({message:"Failed to login with google"});
    }
}


export async function SendOTP(req,res){

    if(req.user == null){
        res.status(403).json({message:"Unauthorized!"});
        return;
    }

    const otp = Math.floor(Math.random()*9000)+1000;

    const newOPT = new OTP({
        email:req.user.email,
        otp:otp
    })

    await newOPT.save();
    

    const message={
        from :"chathuraasela11@gmail.com",
        to :req.user.email,
        subject :"Validating OTP",
        text : "Your otp code is " + otp
    }

    transport.sendMail(message,(err,info)=>{

        if(err){
            res.status(500).json({message:"Failed to send OTP!"})
        }else{
            res.status(200).json({message:"OTP sent successfully!"})
        }
    })
}

export async function VerifyOTP(req,res){
    if(req.user == null){
        res.status(403).json({message:"Unauthorized!"});
        return;
    }

    const code = req.body.code

    const otp = await OTP.findOne({
        email : req.user.email,
        otp : code
    })

    if(otp == null){
        res.status(404).json({message:"Invaid OTP"});
    }else{
        await OTP.deleteOne({
            email : req.user.email,
            otp : code
        })

        await User.updateOne({email:req.user.email},{emailVerified:true})

        res.status(200).json({message:"Email verified successfully!"});
    }
}

export async function ForgotPassword(req, res) {
    const email = req.params.email;
    const tempPassword = Math.random().toString(36).slice(-10);

    const message = {
        from: "chathuraasela11@gmail.com",
        to: email,
        subject: "Forgot Password",
        text: "Your temporary password is " + tempPassword,
    };

    const user = await User.findOne({email:email})

    if(user == null){
        return res.status(404).json({message:'User not found!'});
    }

    transport.sendMail(message, async (err, info) => {
        if (err) {
            res.status(500).json({ message: "Failed to send temporary password!" });
        } else {
            const password = bcrypt.hashSync(tempPassword, 10);
            try {
                await User.updateOne({ email: email }, { password: password });
                res.status(200).json({ message: "Temporary password sent successfully!" });
            } catch (updateErr) {
                res.status(500).json({ message: "Email sent, but failed to update password!" });
            }
        }
    });
}

export async function ChangeUserPassword(req,res){
    const email = req.params.email;
    const data = req.body;

    const user = await User.findOne({email:email})

    if(user == null){
        return res.status(404).json({message:"User not found!"});
    }else{
        
        const isPasswordCorrect = bcrypt.compareSync(data.password,user.password);

        if(isPasswordCorrect){
            
            const password = bcrypt.hashSync(data.newPassword,10)
            try{
                await User.updateOne({email:email},{password : password});
                res.status(200).json({ message: "Password changed successfully!" });
            }catch(error){
                res.status(500).json({ message: "Failed to change password!" });
            }
        }else{
            return res.status(401).json({message:"Invalid password!"});
        }
    }
}

export async function ForgotPasswordSendOTP(req,res){

    const email = req.params.email;

    try {
        const user =await User.findOne({email:email});
        if(user == null){
            return res.status(404).json({message:"User not found!"});
        }
    } catch (error) {
        return res.status(500).json({message:"Failed to load user!"});
    }

    const otp = Math.floor(Math.random()*9000)+1000;

    const newOPT = new OTP({
        email:email,
        otp:otp
    })

    await newOPT.save();
    

    const message={
        from :"chathuraasela11@gmail.com",
        to :email,
        subject :"Validating OTP",
        text : "Your otp code is " + otp
    }

    transport.sendMail(message,(err,info)=>{

        if(err){
            res.status(500).json({message:"Failed to send OTP!"})
        }else{
            res.status(200).json({message:"OTP sent successfully!"})
        }
    })
}

export async function ForgotPasswordVerifyOTP(req,res){
    
    const email = req.params.email

    try {
        const user =await User.findOne({email:email});
        if(user == null){
            return res.status(404).json({message:"User not found!"});
        }
    } catch (error) {
        return res.status(500).json({message:"Failed to load user!"});
    }

    const code = req.body.code

    const otp = await OTP.findOne({
        email : email,
        otp : code
    })

    if(otp == null){
        res.status(404).json({message:"Invaid OTP"});
    }else{
        await OTP.deleteOne({
            email : email,
            otp : code
        })

        await User.updateOne({email:email},{emailVerified:true})

        res.status(200).json({message:"Email verified successfully!"});
    }
}