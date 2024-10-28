import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
    try {
        const connnectionInstance = await mongoose.connect("mongodb+srv://snax:snax01@backcluster.zrnsa.mongodb.net/backClusterDatabase");
        console.log(`\n Mongodb Connected !! DB HOST : ${connnectionInstance}`);
        
    } catch (error) {
        console.log(error);
        process.exit(1);        
    }
}