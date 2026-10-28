import express from 'express';
import "dotenv/config";
import connectDb from './configs/connectDb.js';
import cookieParser from 'cookie-parser';
import cors from "cors"
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
import paymentRouter from './routes/payment.route.js';

const app= express();

const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  "https://prepsense-client-main.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/interview",interviewRouter)
app.use("/api/payment" , paymentRouter)

const PORT=process.env.PORT || 5000;


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDb()
})
//we used openapi gateway to analyze resume
