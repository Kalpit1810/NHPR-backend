import express, { urlencoded } from "express";
import cors from "cors";
import DBConnection from "../database/db.js"
import userRouter from "../routes/userRouter.js"
const app = express();

// MiddleWares
app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/register",userRouter);

DBConnection();



app.listen("3001", () => console.log("server started!"));
