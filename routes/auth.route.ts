import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resendCode,
  verifyUser,
} from "../controllers/auth.controller";
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

// Public routes

router.route("/login").post(loginUser);

router.route("/register").post(registerUser);

router.route("/verify").put(verifyUser);

router.route("/resend-code").put(resendCode);

router.route("/logout").get(logoutUser);

// Protected routes

router.use(verifyJWT);

router.route("/get").get(getUser);

export default router;
