import React from 'react';
import { Heart, ThumbsDown, Shield,  Tag, User, Calendar } from 'lucide-react';
import type { Article } from '../types';


interface ArticleCardProps {
  article: Article;
  currentUserId?: string; 
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onBlock: (id: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, currentUserId, onLike, onDislike, onBlock }) => {
  const isLiked = article.isLiked !== undefined 
    ? article.isLiked 
    : currentUserId 
      ? article.likes.some(like => like.toString() === currentUserId.toString())
      : false;
  
  const isDisliked = article.isDisliked !== undefined 
    ? article.isDisliked 
    : currentUserId 
      ? article.dislikes.some(dislike => dislike.toString() === currentUserId.toString())
      : false;
  
  const isBlocked = article.isBlocked !== undefined 
    ? article.isBlocked 
    : currentUserId 
      ? article.blocks.some(block => block.toString() === currentUserId.toString())
      : false;

  const likesCount = article.likesCount ?? article.likes.length;
  const dislikesCount = article.dislikesCount ?? article.dislikes.length;
  

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Get author name - handle both populated and unpopulated cases
  const authorName = typeof article.author === 'object' && 'firstName' in article.author 
    ? article.author.firstName
    : 'Unknown Author';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
        isBlocked ? 'opacity-50 border-2 border-red-200' : ''
      }`}
    >
      {/* Article Image */}
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-fill transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
          </div>
          {isBlocked && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
              <Shield className="text-red-600" size={48} />
            </div>
          )}
        </div>
      )}

      {/* Article Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">{authorName}</span>
          <span className="text-gray-300">•</span>
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(article.createdAt)}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.description}
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLike(article._id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={16} className={isLiked ? 'fill-current' : ''} />
              <span>{formatNumber(likesCount)}</span>
            </button>

            <button
              onClick={() => onDislike(article._id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isDisliked
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsDown size={16} className={isDisliked ? 'fill-current' : ''} />
              <span>{formatNumber(dislikesCount)}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBlock(article._id)}
              className={`p-2 rounded-lg transition-colors ${
                isBlocked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isBlocked ? 'Unblock article' : 'Block article'}
            >
              <Shield size={16} className={isBlocked ? 'fill-current' : ''} />
            </button>

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;