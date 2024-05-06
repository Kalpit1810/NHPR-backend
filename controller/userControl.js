import { userModel } from "../models/Users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio"
dotenv.config();

const userAadhaarRegisterControl = async (req, res) => {
  const { aadhaar } = req.body;

  try {
    const user1 = await userModel.findOne({ aadhaar });

    // Check if user already Exists.
    if (user1) {
      console.log("Aadhaar already exist!");
      return res.json({
        message: `User with email ${userEmail} already exists!`,
        success: false,
      });
    }
    const newUser = new userModel({
      aadhaar,
    });

    await newUser.save();
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET);

    console.log("OTP is sent to registered phone number.");
    return res.json({
      message: "Aadhaar Registered Successfully!!",
      success: true,
      token,
    });
  } catch (error) {
    await userModel.findOneAndDelete({ aadhaar });
    console.log("Error: ", error.message);
    return res.json({
      message: "Some error occured please try again!",
      success: false,
    });
  }
};

const userSendVerifiactionEmail = async (req, res) => {
  const { token, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "kalpit1018@gmail.com",
      pass: process.env.PASS_EMAIL,
    },
  });

  const mailOptions = {
    from: "kalpit1018@gmail.com",
    to: email,
    subject: "NHPR Email Verifiacation",
    html: `To verify your Email click on the <a href='http://localhost:3001/api/register/verifyEmail?token=${token}'>link</a>`,
  };

  try {
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(`Error sending Verification email\n ${error}`);
        return res.json({
          message: `Error sending Verification email .`,
          success: false,
        });
      }
      console.log("Email sent:", info?.response);
      return res.json({
        message: `Verification email sent to ${email}`,
        success: true,
      });
    });
  } catch (err) {
    console.log("Error sending email Verification:", err);
  }
};

const userVerifyEmail = async (req, res) => {
  const { token } = req.query;
  const aadhaar = jwt.decode(token, process.env.JWT_SECRET);
  try {
    await userModel.findOneAndUpdate({ aadhaar }, { emailVerified: true });
    console.log(req.query);
    return res.json({
      message: `Email Verified ${token}`,
      success: true,
    });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.json({
      message: "Some error occured please try again!",
      success: false,
    });
  }
};

const userSendOTP = async (req, res) => {
  const {token,phone} = req.body;
  const aadhaar = jwt.decode(token, process.env.JWT_SECRET);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_SERVICE_SID;
  const client = twilio(accountSid, authToken);

  try {
    await userModel.findOneAndUpdat({aadhaar},{phone})
    client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phone, channel: "sms" })
      .then((verification) => {
          return res.json({
            message: "OTP Sent to your Phone number.",
            sucess: true,
          });
      });
  } catch (error) {
    console.log(error.message);
    return res.json({
      message: "Failed to send OTP. Try again",
      sucess: false,
    });
  }
};

const userVerifyOTP = async (req, res) => {
  const { token,phone, code } = req.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_SERVICE_SID;
  const client = twilio(accountSid, authToken);
  const aadhaar = jwt.decode(token, process.env.JWT_SECRET);

  try {
    client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code })
      .then(async (verification_check) => {
          await userModel.findOneAndUpdate({ aadhaar }, { accountVerified: true,phoneVerified: true });
          return res.json({
            message: `OTP Verified ${token}`,
            success: true,
          });
      });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.json({
      message: "Some error occured please try again!",
      success: false,
    });
  }
};

const userAadhaarUpdateControl = async (req, res) => {
  const {
    token,
    username,
    phone,
    email,
    dob,
    district,
    subDistrict,
    category,
    subCategory,
    role,
    password,
  } = req.body;
  const aadhaar = jwt.decode(token, process.env.JWT_SECRET);
  try {
    const user1 = await userModel.findOne({ aadhaar });
    if (!accountVerified) {
      return res.json({
        message: "Account not Verified. Please try again!",
        success: false,
      });
    } else if (!phoneVerified) {
      return res.json({
        message: "Phone not Verified. please try again!",
        success: false,
      });
    } else if (!emailVerified) {
      return res.json({
        message: "Email not Verified .Please try again!",
        success: false,
      });
    } else {
      await userModel.findOneAndUpdate(
        { aadhaar },
        {
          username,
          phone,
          email,
          dob,
          district,
          subDistrict,
          category,
          subCategory,
          role,
          password,
        }
      );

      console.log(`Details Updated.`);
      return res.json({
        message: "Details updated.",
        success: true,
      });
    }
  } catch (error) {
    console.log("Error: ", error.message);
    return res.json({
      message: "Some error occured please try again!",
      success: false,
    });
  }
};
export {
  userAadhaarRegisterControl,
  userAadhaarUpdateControl,
  userSendVerifiactionEmail,
  userVerifyEmail,
  userSendOTP,
  userVerifyOTP,
};
