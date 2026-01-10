import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

app.use(cors({
    origin : process.env.CROSS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.static("public"))
app.use(express.urlencoded({limit:"16kb"}))
app.use(cookieParser())

import userRouter from "./Routes/user.routes.js"
import movieRouter from "./Routes/movie.routes.js"
app.use('/api/v1/user' , userRouter)
app.use('/api/v1/movies' , movieRouter)


export {app}