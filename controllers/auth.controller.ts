import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import generateToken from "../utils/tokenGenerator";
import { sendEmail } from "../services/mailer";
import { mail, mailText } from "../utils/mail";
import Location from "../models/location.model";

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your account",
      });
    }

    const token = generateToken({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
      role: user.role,
      city: user.city ? user.city.toString() : null,
      createdAt: user.createdAt.toString(),
    });

    const data = {
      user: { ...user.toObject(), password: null },
      token,
    };

    return res.cookie("token", token).status(200).json({
      success: true,
      data,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, password, email, city, aadhar, role } = req.body;
    if (!fullName || !email || !city || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      } else {
        await existingUser.deleteOne();
      }
    }

    let cityExists = await Location.findOne({ city });
    if (!cityExists) {
      cityExists = await Location.create({ city });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000);
    const codeExpiry = Date.now() + 600_000;

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      city: cityExists?._id || undefined,
      aadhar,
      code,
      codeExpiry,
      role,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not created",
      });
    }

    await sendEmail({
      to: email,
      html: mail(code.toString()),
      subject: "Verify your email",
      text: mailText(code.toString()),
    });

    const data = { ...user.toObject(), password: null };

    return res.status(200).json({
      success: true,
      data,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getUser = async (req: Request, res: Response) => {
  if (!req?.user?._id) {
    return res.status(401).json({
      success: false,
      message: "User not verified",
    });
  }

  return res.status(200).json({
    success: true,
    data: req.user,
    message: "User fetched successfully",
  });
};

const verifyUser = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    const isCodeInvalid = user.code !== code;
    const isCodeExpired = new Date(user.codeExpiry) < new Date();

    if (isCodeInvalid) {
      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }
    if (isCodeExpired) {
      return res.status(400).json({
        success: false,
        message: "Code expired",
      });
    }

    user.isVerified = true;
    user.code = "";
    user.codeExpiry = new Date();
    await user.save();

    const token = generateToken({
      _id: user._id,
      city: user.city?.toString() || null,
      fullName: user.fullName,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt.toString(),
    });

    return res.status(200).cookie("token", token).json({
      success: true,
      data: { token, user },
      message: "User verified successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const resendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    const codeExpiry = Date.now() + 600_000;

    user.code = code.toString();
    user.codeExpiry = new Date(codeExpiry);

    await user.save();

    await sendEmail({
      to: email,
      html: mail(code.toString()),
      subject: "Verify your email",
      text: mailText(code.toString()),
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.trace("I am resendCode!!!!", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  return res
    .status(200)
    .clearCookie("token")
    .json({ success: true, message: "User logged out" });
};

export { loginUser, registerUser, verifyUser, resendCode, getUser, logoutUser };
