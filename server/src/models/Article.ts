import mongoose, { Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  category: string;
  description: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  blocks: mongoose.Types.ObjectId[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new mongoose.Schema<IArticle>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  imageUrl: { type: String },
}, { timestamps: true });

export default mongoose.model<IArticle>('Article', ArticleSchema);