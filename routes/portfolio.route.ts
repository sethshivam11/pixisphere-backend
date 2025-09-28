import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import {
  addImagesToPortfolio,
  createPortfolio,
  deleteImageFromPortfolio,
  getPortfolio,
  getUserPortfolio,
  reOrderPortfolio,
} from "../controllers/portfolio.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.array("images", 5), createPortfolio);

router.route("/:id").get(getPortfolio);

router.route("/user/:userId").get(getUserPortfolio);

router.route("/reorder/:id").patch(reOrderPortfolio);

router.route("/:id").put(upload.array("images", 5), addImagesToPortfolio);

router.route("/image/:id").delete(deleteImageFromPortfolio);

export default router;
