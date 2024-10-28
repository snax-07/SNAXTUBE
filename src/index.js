import dotenv from "dotenv"
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
dotenv.config({path : "./.env"})
connectDB()
.then(() => {
    app.on('error' , () => {
        console.log("Unknown error");
        
    })
    app.listen(8080, () => console.log(`server ios running on ${process.env.PORT}`)
    );
})
.catch((err) => {
        console.log(err);
    
    })
    

        app.listen(process.env.PORT , () => `server is running on ${process.env.PORT}`);

//===========================ANOTHER APPROACH FOR THE ABOVE OPERATION============================//
// import express from 'express'
// const app = express()
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/ ${DB_NAME}`);
//         app.on("error" , (error) => {
//             console.log(error);
            
//         })
//     } catch (error) {
//         console.log(error);
//         throw error
//     }
// })()