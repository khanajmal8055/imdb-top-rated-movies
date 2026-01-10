import databaseConnection from "./DB/index.js";
import dotenv from "dotenv";

import { app } from "./app.js";

dotenv.config({
    path:'/.env'
})

databaseConnection()
.then(() => {
    app.on("error" , (error) => {
        console.log("error" , error);
        throw error
        
    })

    app.listen(process.env.PORT || 5000 , () => {
        console.log(`Server is running at port ${process.env.PORT}`);
        
    })
})
.catch((error) => {
    console.log(`DB connection falied`,error);
    
})