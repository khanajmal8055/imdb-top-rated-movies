import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const databaseConnection = async()=>{
    try {
        const connnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
        console.log(`MONGO DB connected successfully || DB Host ${connnectionInstance.connection.host}`);
           
    } 
    catch (error) {
        console.log('MONGO DB connectivity error' , error);
        process.exit(1);
        
    }
}

export default databaseConnection