import Category from "../models/category.model";
import { Request, Response } from "express";

const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name, description });
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create category" });
    }

    return res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({
      success: true,
      data: categories,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!id || (name === undefined && description === undefined)) {
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
            ? "Only admin can update category"
            : "User not verified",
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.name = name?.toString() ?? category.name;
    category.description = description?.toString() ?? category.description;
    await category.save();

    return res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide category id",
      });
    }

    if (!req.user || req.user.role !== "admin") {
      return res.status(req.user?.role !== "admin" ? 409 : 401).json({
        success: false,
        message:
          req.user?.role !== "admin"
            ? "Only admin can update category"
            : "User not verified",
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Cannot delete category",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export { createCategory, getCategories, updateCategory, deleteCategory };
