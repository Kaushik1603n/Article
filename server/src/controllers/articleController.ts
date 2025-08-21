import { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { ArticleRepository } from "../Repository/articleRepository";
import { UserRepository } from "../Repository/UserRepository";
import { HttpStatusCode, MESSAGES } from "./constants";
import { Types } from "mongoose";

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
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.ALL_FIELDS_REQUIRED });
    }

    if (name.trim().length < 3) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.TITLE_MIN_LENGTH });
    }

    if (req.file && !req.file.mimetype.startsWith("image/")) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.ONLY_IMAGES_ALLOWED });
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

    if (!imageUrl) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Image upload failed, please try again." });
    }

    const newArticle = await ArticleRepository.create({
      title: name,
      description,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [tags],
      imageUrl,
      author: userId,
    });

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      article: newArticle,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const editArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.params;
    const { name, description, content, category, tags } = req.body;

    if (!userId || !id) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.ALL_FIELDS_REQUIRED });
    }

    if (!name && !description && !content && !category && !tags && !req.file) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.NO_UPDATE_FIELDS });
    }

    if (name && name.trim().length < 3) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.TITLE_MIN_LENGTH });
    }

    const existingArticle = await ArticleRepository.findById(id);
    if (!existingArticle) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: MESSAGES.ARTICLE_NOT_FOUND });
    }

    if (existingArticle.author._id.toString() !== userId.toString()) {
      return res
        .status(HttpStatusCode.FORBIDDEN)
        .json({ message: MESSAGES.UNAUTHORIZED_ARTICLE_EDIT });
    }

    let imageUrl = existingArticle.imageUrl;
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

    const updatedArticle = await ArticleRepository.update(id, updateData);

    res.status(HttpStatusCode.OK).json({
      success: true,
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.params;

    if (!userId || !id) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.ALL_FIELDS_REQUIRED });
    }

    const existingArticle = await ArticleRepository.findById(id);
    if (!existingArticle) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: MESSAGES.ARTICLE_NOT_FOUND });
    }

    if (existingArticle.author._id.toString() !== userId.toString()) {
      return res
        .status(HttpStatusCode.FORBIDDEN)
        .json({ message: MESSAGES.UNAUTHORIZED_ARTICLE_DELETE });
    }

    await ArticleRepository.delete(id);

    res.status(HttpStatusCode.OK).json({ message: MESSAGES.ARTICLE_DELETED });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.UNAUTHORIZED });
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    const preferencesArray = Array.isArray(user.preferences)
      ? user.preferences
      : user.preferences
      ? [user.preferences]
      : [];

    const articles = await ArticleRepository.findByPreferences(
      preferencesArray
    );

    const feed = articles.map((article: any) => ({
      ...article,
      likesCount: article.likes.length,
      dislikesCount: article.dislikes.length,
      blocksCount: article.blocks.length,
      isLiked: article.likes.some(
        (like: Types.ObjectId) => like.toString() === userId
      ),
      isDisliked: article.dislikes.some(
        (dislike: Types.ObjectId) => dislike.toString() === userId
      ),
      isBlocked: article.blocks.some(
        (block: Types.ObjectId) => block.toString() === userId
      ),
    }));

    res.status(HttpStatusCode.OK).json({
      success: true,
      feed: feed || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const getMyArticle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.UNAUTHORIZED });
    }

    const articles = await ArticleRepository.findByAuthor(userId);

    res.status(HttpStatusCode.OK).json({
      success: true,
      feed: articles || [],
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const handleReaction = async (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    const { articleId } = req.params;
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.UNAUTHORIZED });
    }

    if (!articleId) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.ARTICLE_ID_MISSING });
    }

    if (!["like", "dislike", "block"].includes(action)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.INVALID_ACTION });
    }

    const updatedArticle = await ArticleRepository.handleReaction(
      articleId,
      userId,
      action as "like" | "dislike" | "block"
    );
    if (!updatedArticle) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: MESSAGES.ARTICLE_NOT_FOUND });
    }

    res.status(HttpStatusCode.OK).json({
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
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const setPreferences = async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.UNAUTHORIZED });
    }

    const user = await UserRepository.updatePreferences(userId, preferences);
    if (!user) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({
      message: MESSAGES.PREFERENCES_UPDATED,
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
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};
