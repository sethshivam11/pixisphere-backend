import express, { type Request, type Response } from "express";
import connectDb from "./config/db";
import cookieParser from "cookie-parser";
import { UserI } from "./models/user.model";

declare global {
  namespace Express {
    interface User extends UserI {}
    interface Request {
      user?: User;
    }
  }
}

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

import authRoutes from "./routes/auth.route";
import categoryRoutes from "./routes/category.route";
import locationRoutes from "./routes/location.route";
import enquiryRoutes from "./routes/enquiry.route";
import reviewRoutes from "./routes/review.route";
import portfolioRoutes from "./routes/portfolio.route";
import adminRoutes from "./routes/admin.route";

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Pixisphere Backend",
  });
});

connectDb()
  .then(() =>
    app.listen(port, () => console.log("App is running on port", port))
  )
  .catch((err) => console.log(err));
