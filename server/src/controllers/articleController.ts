import { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Article from "../models/Article";
import dotenv from "dotenv";
import { Types } from "mongoose";
import User from "../models/User";
dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadMiddleware = upload.single("image");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const article = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, content, category, tags } = req.body;

    if (!userId || !name || !description || !content || !category) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (name.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters long." });
    }

    if (req.file && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed." });
    }

    let imageUrl = null;
    if (req.file) {
      const file = req.file;
      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "articles" }, (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            })
            .end(file.buffer);
        }
      );

      imageUrl = result.secure_url;
    }

    const newArticle = await Article.create({
      title: name,
      description,
      content: content,
      category: category,
      tags: Array.isArray(tags) ? tags : [tags],
      imageUrl: imageUrl,
      author: userId,
    });

    res.status(201).json({
      success: true,
      article: newArticle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, content, category, tags } = req.body;
    const { userId } = req.params;

    if (!userId || !id) {
      return res
        .status(400)
        .json({ message: "Missing user ID or article ID." });
    }

    if (!name && !description && !content && !category && !tags && !req.file) {
      return res.status(400).json({ message: "No update fields provided." });
    }

    if (name && name.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters long." });
    }

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (existingArticle.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this article" });
    }

    let imageUrl = existingArticle.imageUrl; // Keep existing image by default

    if (req.file) {
      const file = req.file;

      if (existingArticle.imageUrl) {
        const publicId = existingArticle.imageUrl
          .split("/")
          .pop()
          ?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`articles/${publicId}`);
        }
      }

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "articles" }, (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            })
            .end(file.buffer);
        }
      );

      imageUrl = result.secure_url;
    }

    const updateData: any = {
      title: name,
      description,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [tags],
      ...(imageUrl && { imageUrl }),
      updatedAt: new Date(),
    };

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.params;

    if (!userId || !id) {
      return res
        .status(400)
        .json({ message: "Missing user ID or article ID." });
    }

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (existingArticle.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this article" });
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = await User.findById(userId, { preferences: 1 });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const preferencesArray = Array.isArray(user.preferences)
      ? user.preferences
      : user.preferences
      ? [user.preferences]
      : [];

    const filter =
      preferencesArray.length > 0
        ? { category: { $in: preferencesArray } }
        : {};

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .populate("author", "firstName email")
      .lean();

    const feed = articles.map((article) => {
      const articleObj = article.toObject ? article.toObject() : article;

      return {
        ...articleObj,
        likesCount: article.likes.length,
        dislikesCount: article.dislikes.length,
        blocksCount: article.blocks.length,
        isLiked: article.likes.some((like) => like.toString() === userId),
        isDisliked: article.dislikes.some(
          (dislike) => dislike.toString() === userId
        ),
        isBlocked: article.blocks.some((block) => block.toString() === userId),
      };
    });

    res.status(200).json({
      success: true,
      feed: feed || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyArticle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const articles = await Article.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "firstName email")
      .lean();

    res.status(200).json({
      success: true,
      feed: articles || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const handleReaction = async (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const { articleId } = req.params;
    const { userId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!articleId) {
      return res.status(401).json({ message: "articleId missing" });
    }

    if (!["like", "dislike", "block"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const article = await Article.findById(articleId).populate(
      "author",
      "firstName email"
    );
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const toggleReaction = (array: Types.ObjectId[]) => {
      const userIdObj = new Types.ObjectId(userId);
      const index = array.findIndex((id) => id.equals(userId));
      if (index === -1) {
        array.push(userIdObj);
      } else {
        array.splice(index, 1);
      }
    };

    switch (action) {
      case "like":
        toggleReaction(article.likes);
        article.dislikes = article.dislikes.filter((id) => !id.equals(userId));
        break;

      case "dislike":
        toggleReaction(article.dislikes);
        article.likes = article.likes.filter((id) => !id.equals(userId));
        break;

      case "block":
        toggleReaction(article.blocks);
        break;
    }

    const updatedArticle = await article.save();

    res.json({
      ...updatedArticle.toObject(),
      likesCount: updatedArticle.likes.length,
      dislikesCount: updatedArticle.dislikes.length,
      blocksCount: updatedArticle.blocks.length,
      isLiked: updatedArticle.likes.some((id) => id.equals(userId)),
      isDisliked: updatedArticle.dislikes.some((id) => id.equals(userId)),
      isBlocked: updatedArticle.blocks.some((id) => id.equals(userId)),
    });
  } catch (error) {
    console.error("Reaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setPreferences = async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;
    const { userId } = req.params;

     if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences: preferences } },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    return res.status(200).json({
      message: "preferences updated successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
