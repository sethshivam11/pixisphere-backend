import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import {
  createReview,
  deleteReview,
  getProfileReviews,
  updateReview,
} from "../controllers/review.controller";

const router = Router();

// Public routes

router.route("/:profileId").get(getProfileReviews);

// Protected routes

router.use(verifyJWT);

router.route("/").post(createReview);

router.route("/:id").put(updateReview);

router.route("/:id").delete(deleteReview);

export default router;
