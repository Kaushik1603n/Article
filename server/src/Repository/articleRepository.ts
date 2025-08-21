import Article, { IArticle } from "../models/Article";
import { Types } from "mongoose";

export class ArticleRepository {
  static async create(articleData: {
    title: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
    imageUrl?: string;
    author: string;
  }): Promise<IArticle> {
    return await Article.create(articleData);
  }

  static async findById(id: string): Promise<IArticle | null> {
    return await Article.findById(id).populate("author", "_id firstName email");
  }

  static async findByPreferences(preferences: string[]): Promise<IArticle[]> {
    const filter = preferences.length > 0 ? { category: { $in: preferences } } : {};
    return await Article.find(filter)
      .sort({ createdAt: -1 })
      .populate("author", "firstName email")
      .lean();
  }

  static async findByAuthor(authorId: string): Promise<IArticle[]> {
    return await Article.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate("author", "firstName email")
      .lean();
  }

  static async update(id: string, updateData: {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    updatedAt?: Date;
  }): Promise<IArticle | null> {
    return await Article.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async delete(id: string): Promise<IArticle | null> {
    return await Article.findByIdAndDelete(id);
  }

  static async handleReaction(
    articleId: string,
    userId: string,
    action: "like" | "dislike" | "block"
  ): Promise<IArticle | null> {
    const article = await Article.findById(articleId).populate("author", "firstName email");
    if (!article) return null;

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

    return await article.save();
  }
}