export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  preferences: string[];
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  author: User 
  likes: string[];
  dislikes: string[];
  blocks: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // For client-side state
  isLiked?: boolean;
  isDisliked?: boolean;
  isBlocked?: boolean;

  likesCount?: number;
  dislikesCount?: number;
  blocksCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  readTime?: number;
}


export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ArticleState {
  articles: Article[];
  userArticles: Article[];
  isLoading: boolean;
  error: string | null;
}