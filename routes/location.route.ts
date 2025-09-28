import { Router } from "express";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "../controllers/city.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

// Public routes

router.route("/").post(createLocation);

router.route("/").get(getLocations);

// Protected routes

router.use(verifyJWT);

router.route("/:id").put(updateLocation);

router.route("/:id").delete(deleteLocation);

export default router;
