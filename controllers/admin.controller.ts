import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import User from "../models/user.model";
import Enquiry from "../models/enquiry.model";

const updatePartnerStatus = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    if (!partnerId || !isValidObjectId(partnerId)) {
      return res.status(400).json({
        success: false,
        message: "Partner id is required",
      });
    }

    const statusValues = ["verified", "rejected", "pending"];
    const { status, comment } = req.body;
    if (!status || !statusValues.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!req.user || req.user?.role !== "admin") {
      return res.status(401).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can update status"
            : "User not authorized",
      });
    }

    const partner = await User.findByIdAndUpdate(
      partnerId,
      {
        status: {
          current: status,
          comment,
        },
      },
      { new: true }
    );
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Partner status updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getPendingVerifications = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "You are authorized to access this resource"
            : "User not authorized",
      });
    }

    const pendingVerifications = await User.find(
      { "status.current": "pending", "isVerified": true, "role": "partner" },
      "fullName email status role"
    );
    if (!pendingVerifications) {
      return res.status(404).json({
        success: false,
        message: "No pending verifications found",
      });
    }

    return res.status(200).json({
      success: true,
      data: pendingVerifications,
      message: "Pending verifications found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user?.role !== "admin") {
      return res.status(401).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "You are not authorized to access this resource"
            : "User not authorized",
      });
    }

    const totalClients = await User.countDocuments({ role: "client" });
    const totalPartners = await User.countDocuments({ role: "partner" });
    const pendingEnquiries = await Enquiry.countDocuments({
      "status.current": "pending",
      "isVerified": true,
      "role": "partner",
    });
    const totalEnquiries = await Enquiry.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalClients,
        totalPartners,
        totalEnquiries,
        pendingEnquiries,
      },
      message: "Dashboard found successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export { updatePartnerStatus, getPendingVerifications, getDashboard };
