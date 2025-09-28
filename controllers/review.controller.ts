import e, { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Review from "../models/review.model";

const createReview = async (req: Request, res: Response) => {
  try {
    const { profile, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!isValidObjectId(profile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile",
      });
    }

    if (!req.user || req.user?.role !== "client") {
      return res.status(400).json({
        success: false,
        message:
          req.user?.role !== "client"
            ? "Only user can post reviews"
            : "User not authorized",
      });
    }

    if (req.user._id.toString() === profile.toString()) {
      return res.status(400).json({
        success: false,
        message: "Self profile cannot be reviewed",
      });
    }

    const review = await Review.create({
      profile,
      rating,
      comment,
      user: req.user._id,
    });
    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Failed to create review",
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
      message: "Review found successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getProfileReviews = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    if (!profileId || !isValidObjectId(profileId)) {
      return res.status(400).json({
        success: false,
        message: !isValidObjectId(profileId)
          ? "Invalid Profile id"
          : "Please provide profile id",
      });
    }

    const reviews = await Review.find({ profile: profileId });
    if (!reviews) {
      return res.status(404).json({
        success: false,
        message: "No reviews found",
      });
    }

    return res.status(200).json({
      success: true,
      data: reviews,
      message: "Reviews found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Review id is required",
      });
    }

    if (!(rating || comment)) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Only admin and user can update review",
      });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    return res.status(200).json({
      success: true,
      data: review,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Review id is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only user and admin can delete reviews",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export { createReview, getProfileReviews, updateReview, deleteReview };
