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
app.use(cookieParser)

export { app }