import Location from "../models/location.model";
import { Request, Response } from "express";

const createLocation = async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res
        .status(400)
        .json({ success: false, message: "city is required" });
    }

    const existingLocation = await Location.findOne({ city });
    if (existingLocation) {
      return res
        .status(400)
        .json({ success: false, message: "Location already exists" });
    }

    const location = await Location.create({ city });
    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create location" });
    }

    return res.status(201).json({
      success: true,
      data: location,
      message: "Location created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await Location.find();
    return res.status(200).json({
      success: true,
      data: locations,
      message: "Locations fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { city } = req.body;
    if (!id || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!req.user || req.user.role !== "admin") {
      return res.status(req.user?.role !== "admin" ? 409 : 401).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can update location"
            : "User not verified",
      });
    }

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    location.city = city.toString();
    await location.save();

    return res.status(200).json({
      success: true,
      data: location,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide location id",
      });
    }

    if (!req.user || req.user.role !== "admin") {
      return res.status(req.user?.role !== "admin" ? 409 : 401).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can update location"
            : "User not verified",
      });
    }

    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Cannot delete location",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export { createLocation, getLocations, updateLocation, deleteLocation };
