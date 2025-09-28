import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import {
  assignEnquiry,
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  getEnquiry,
  getPartnerEnquiries,
  unassignEnquiry,
  updateEnquiryStatus,
} from "../controllers/enquiry.controller";

const router = Router();

// Public routes

router.route("/partner/:userId").get(getPartnerEnquiries);

router.route("/:id").get(getEnquiry);

// Protected routes

router.use(verifyJWT);

router.route("/").get(getEnquiries);

router.route("/").post(createEnquiry);

router.route("/:id").patch(updateEnquiryStatus);

router.route("/assign/:id").put(assignEnquiry);

router.route("/unassign/:id").put(unassignEnquiry);

router.route("/:id").delete(deleteEnquiry);

export default router;
