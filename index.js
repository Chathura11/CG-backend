import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRoute.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cors from 'cors'
import scheduleRouter from './routes/scheduleRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import scheduleProgressRouter from './routes/scheduleProgressRoute.js';



dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use((req,res,next)=>{
    let token = req.header("Authorization");
    if(token != null){
        token = token.replace("Bearer ","");

        jwt.verify(token,process.env.JWT_SECRET_KEY,
        (err,decoded)=>{
            if(!err){
                req.user = decoded;
                
            }
        }
    )
    }
    next();
})

const mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL);

const connection = mongoose.connection;

connection.once("open",()=>{
    console.log("MongoDB connection established successfully!");
})


app.use('/api/users',userRouter);
app.use('/api/schedules',scheduleRouter);
app.use('/api/expenses',expenseRouter);
app.use('/api/scheduleprogresses',scheduleProgressRouter);

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})