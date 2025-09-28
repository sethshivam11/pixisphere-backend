import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

// Public routes

router.route("/").post(createCategory);

router.route("/").get(getCategories);

// Protected routes

router.use(verifyJWT);

router.route("/:id").put(updateCategory);

router.route("/:id").delete(deleteCategory);

export default router;
