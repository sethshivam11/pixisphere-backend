import { Request, Response } from "express";
import Portfolio from "../models/portfolio.model";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../services/cloudinary";

const createPortfolio = async (req: Request, res: Response) => {
  try {
    const { descriptions } = req.body;
    if (descriptions === undefined || descriptions.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const images = req.files as Express.Multer.File[];
    if (!images || images.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide image files",
      });
    }

    if (images.some((img) => img.size > 50 * 1024 * 1024)) {
      return res.status(400).json({
        success: false,
        message: "Each image must be less than 50MB",
      });
    }

    if (!req?.user || req.user?.role !== "partner") {
      return res.status(401).json({
        success: false,
        message:
          req.user?.role !== "partner"
            ? "Only partners can create portfolio"
            : "User not authenticated",
      });
    }
    let mediaItems: {
      index: number;
      url: string;
      description?: string;
    }[] = [];

    const descriptionsArray = Array.isArray(descriptions)
      ? descriptions
      : [descriptions];

    await Promise.all(
      images.map(async (item, index) => {
        const image = await uploadToCloudinary(item.path);
        if (image?.secure_url) {
          mediaItems.push({
            index,
            url: image.secure_url,
            description: descriptionsArray?.[index] || "",
          });
        }
      })
    );

    const portfolio = await Portfolio.create({
      user: req.user._id,
      media: mediaItems,
    });
    if (!portfolio) {
      return res.status(400).json({
        success: false,
        message: "Failed to create portfolio",
      });
    }

    return res.status(201).json({
      success: true,
      data: portfolio,
      message: "Portfolio created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getPortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: portfolio,
      message: "Portfolio fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getUserPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: portfolio,
      message: "Portfolio fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const reOrderPortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide portfolio ID",
      });
    }

    const { media } = req.body;
    const isMediaInvalid =
      !media ||
      !Array.isArray(media) ||
      media.some(
        (item: { url: string; index: number; description?: string }) =>
          item.url === undefined ||
          item.index === undefined ||
          item.description === undefined
      );

    if (isMediaInvalid) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid media items",
      });
    }

    const sortedMedia = media.sort((a, b) => a.index - b.index);

    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      { media: sortedMedia },
      { new: true }
    );
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: portfolio,
      message: "Portfolio reordered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const addImagesToPortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { descriptions } = req.body;

    if (!id || descriptions === undefined || descriptions.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const images = req.files as Express.Multer.File[];
    if (!images || images.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide image files",
      });
    }

    if (images.some((img) => img.size > 50 * 1024 * 1024)) {
      return res.status(400).json({
        success: false,
        message: "Each image must be less than 50MB",
      });
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    let media = [...portfolio.toObject().media];
    if (media.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Portfolio can have a maximum of 5 images",
      });
    }

    if (media.length + images.length > 5) {
      return res.status(400).json({
        success: false,
        message: `You can add maximum of ${5 - media.length} images`,
      });
    }

    const descriptionsArray = Array.isArray(descriptions)
      ? descriptions
      : [descriptions];

    await Promise.all(
      images.map(async (item, index) => {
        const image = await uploadToCloudinary(item.path);
        if (image?.secure_url) {
          media.push({
            index: media.length,
            url: image.secure_url,
            description: descriptionsArray?.[index] || "",
          });
        }
      })
    );

    portfolio.media = media;
    await portfolio.save();

    return res.status(200).json({
      success: true,
      data: portfolio,
      message: `Successfully added ${images.length} image(s) to portfolio`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteImageFromPortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide portfolio ID",
      });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Please provide image URL to delete",
      });
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    await deleteFromCloudinary(image);
    const updatedMedia = portfolio.media
      .filter((item) => item.url !== image)
      .sort((a, b) => a.index - b.index)
      .map((item, newIndex) => ({
        ...item,
        index: newIndex,
      }));

    portfolio.media = updatedMedia;
    await portfolio.save();

    return res.status(200).json({
      success: true,
      data: portfolio,
      message: "Image deleted from portfolio successfully",
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
  getPortfolio,
  createPortfolio,
  getUserPortfolio,
  reOrderPortfolio,
  addImagesToPortfolio,
  deleteImageFromPortfolio,
};
