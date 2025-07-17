import React from 'react';
import { Edit, Trash2, Calendar, User } from 'lucide-react';
import type { Article } from '../types';

interface MyArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
}

const MyArticleCard: React.FC<MyArticleCardProps> = ({ article, onEdit, onDelete }) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get author name - handle both populated and unpopulated cases
  const authorName = typeof article.author === 'object' && 'firstName' in article.author 
    ? article.author.firstName
    : 'Unknown Author';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
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
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(article)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="Edit article"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(article._id)}
            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Delete article"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyArticleCard;