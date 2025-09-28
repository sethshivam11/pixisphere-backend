import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["token"] ??
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not verified",
      });
    }

    const decodedToken = (await jwt.verify(
      token,
      process.env.JWT_SECRET as string
    )) as JwtPayload;

    if (!decodedToken._id) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(
      decodedToken._id,
      "-password -aadhar -code -codeExpiry"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User not verified",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export default verifyJWT;
