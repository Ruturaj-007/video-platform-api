import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Only allow requests coming from this specific frontend URL
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// excess json can cause server crash
app.use(express.json({
    limit: "16kb"
}))

// middleware allows your server to read form data
app.use(express.urlencoded({
    extended:true, limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser()) // VIP-Helps us to acess cookie in req and response

// routes import
import userRouter from './routes/user.routes.js'

// routers declaration
app.use("/api/v1/users", userRouter) // user trying to visit till /users i dont handle that i pass on to userRouter

// user trying to visit http://localhost:8080/api/v1/users/register

export { app }