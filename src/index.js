// require("dotenv").config({path: "./.env" });
import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


connectDB()
.then(()=>{
    app.on("error", (err)=>{
        console.error("Error in Express app:", err);
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("Database connection established successfully.");
    })
})
.catch((err)=>{
    console.error("Failed to connect to the database:", err);
    process.exit(1);
})




/*

import express from "express";
const app = express();

( async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (err)=>{
            console.error("Error in Express app:", err);
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
        
    }
})

*/
