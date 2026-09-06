import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

// app.use() is used for all configure or middlewares
// we can configure CORS as there options are object inside it
// CORS_ORIGIN mein * value put krdene se kahin se bhi request aaye usko response mil jyega
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Data kaafi jagah se aa skta hai like form mein json mein, toh json kitna bhi lamba accept nhi kr skty server crash ho jyega toh hum ek security purpose k liye uspr limit lga denge configure k through
app.use(express.json({limit: "16kb"}));

// for data coming from url
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// jab hum apne hi server pr kuch files store rkhna chahte hai toh ek public folder mein assests rkh dete hai so that koi bhi access kr ske, tb static keyword k use krte hai
app.use(express.static("public"))

// cookie parser ka main usecase hai ki hum apne server se browser k ander ki cookie ka access kr ske or crud operations apply kr ske
app.use(cookieParser())
//cookie parser k ander bhi options hote hai but abhi tk use krne ki jrrurt hi n pdi hai


// routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter);

// app.use((err, req, res, next) => {
//     const statusCode = err.statusCode || 500;
//     return res.status(statusCode).json({
//         statusCode,
//         success: false,
//         message: err.message || "Internal Server Error",
//         errors: err.errors || []
//     });
// });

export {app};