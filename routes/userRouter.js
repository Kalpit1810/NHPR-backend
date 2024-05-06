import express from "express";
import { userAadhaarRegisterControl, userSendVerifiactionEmail,userVerifyEmail,userSendOTP,userVerifyOTP } from "../controller/userControl.js";

const userRouter = express.Router();

userRouter.post("/aadhaar", userAadhaarRegisterControl);
userRouter.post("/sendVerifiactionEmail", userSendVerifiactionEmail);
userRouter.get("/verifyEmail", userVerifyEmail);
userRouter.post("/sendOTP", userSendOTP);
userRouter.post("/verifyOTP", userVerifyOTP);

export default userRouter;
