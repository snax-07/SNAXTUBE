import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin : process.env,
    credentials : true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true , limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// ROUTES FROM ROUTES/USERROUTSE    
import userRouter from './routes/user.routes.js'

//ROUTSE DECLARTION
app.use("/api/v1/users" , userRouter)
export {app}