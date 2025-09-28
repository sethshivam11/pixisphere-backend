import { Router } from "express";
import {
  getDashboard,
  getPendingVerifications,
  updatePartnerStatus,
} from "../controllers/admin.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/dashboard").get(getDashboard);

router.route("/verifications").get(getPendingVerifications);

router.route("/status/:partnerId").put(updatePartnerStatus);

export default router;
