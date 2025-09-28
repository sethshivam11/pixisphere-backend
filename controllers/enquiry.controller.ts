import { Request, Response } from "express";
import Enquiry from "../models/enquiry.model";
import Category from "../models/category.model";
import Location from "../models/location.model";
import User from "../models/user.model";
import mongoose from "mongoose";

const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { category, date, budget, city, message } = req.body;
    if (!category || !date || !budget || !city || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!req?.user || req.user?.role !== "client") {
      return res.status(401).json({
        success: false,
        message:
          req.user?.role !== "partner"
            ? "Only clients can create portfolio"
            : "User not authenticated",
      });
    }

    let categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      categoryExists = await Category.create({ name: category });
    }

    let cityExists = await Location.findOne({ city });
    if (!cityExists) {
      cityExists = await Location.create({ city });
    }

    const users = await User.find(
      {
        $or: [{ city: cityExists?._id }, { category: category?._id }],
        role: "partner",
      },
      "_id"
    );

    const assignedPartners = users.map((user) => user._id.toString());

    const enquiry = await Enquiry.create({
      date,
      budget,
      message,
      assignedPartners,
      client: req.user._id,
      category: categoryExists?._id,
      city: cityExists?._id,
    });

    if (!enquiry) {
      return res.status(400).json({
        success: false,
        message: "Failed to create Enquiry",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Enquiry created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry id is required",
      });
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Enquiry found successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getEnquiries = async (req: Request, res: Response) => {
  try {
    const enquiries = await Enquiry.find();
    if (!enquiries) {
      return res.status(400).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiries,
      message: "Enquiries found successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getPartnerEnquiries = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const enquiry = await Enquiry.find({ assignedPartners: { $in: [userId] } });
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiries not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Enquiries found successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const assignEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry Id is required",
      });
    }

    const { partners } = req.body;
    if (!partners || !Array.isArray(partners)) {
      return res.status(400).json({
        success: false,
        message: "Partners are required",
      });
    }

    const isValidIds = partners.some((partner) =>
      mongoose.isValidObjectId(partner)
    );
    if (!isValidIds) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide valid partners" });
    }

    if (!req.user || req.user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can assign partners"
            : "User not authenticated",
      });
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    enquiry.assignedPartners = [...enquiry.assignedPartners, ...partners];
    await enquiry.save();

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Partners assigned successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const unassignEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry Id is required",
      });
    }

    const { partners } = req.body;
    if (!partners || !Array.isArray(partners)) {
      return res.status(400).json({
        success: false,
        message: "Partners are required",
      });
    }

    const isValidIds = partners.some((partner) =>
      mongoose.isValidObjectId(partner)
    );
    if (!isValidIds) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide valid partners" });
    }

    if (!req.user || req.user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can unassign partners"
            : "User not authenticated",
      });
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    enquiry.assignedPartners = enquiry.assignedPartners.filter(
      (item) => !partners.includes(item.toString())
    );
    await enquiry.save();

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Partners unassigned successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry Id is required",
      });
    }
    const statusValues = ["new", "responded", "booked", "closed"];

    const { status } = req.body;
    if (
      !status ||
      typeof status !== "string" ||
      !statusValues.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: !statusValues.includes(status)
          ? "Invalid status value"
          : "Status is required",
      });
    }

    if (!req.user || req.user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can update status"
            : "User not authenticated",
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!enquiry) {
      return res.status(400).json({
        success: false,
        message: "Failed to update status",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry Id is required",
      });
    }

    if (!req.user || req.user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can delete status"
            : "User not authenticated",
      });
    }

    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete enquiry",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export {
  createEnquiry,
  getEnquiry,
  getPartnerEnquiries,
  assignEnquiry,
  unassignEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
};
