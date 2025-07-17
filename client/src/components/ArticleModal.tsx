import React from 'react';
import type { Article } from '../types';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
  onBlock: () => void;
  isOwner: boolean;
}

const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onLike,
  onDislike,
  onBlock,
  isOwner
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button 
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{article.title}</h2>
        <p className="text-sm text-blue-600 mb-4">Category: {article.category}</p>
        
        {article.imageUrl && (
          <div className="mb-4">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-64 object-cover rounded-md"
            />
          </div>
        )}
        
        <div className="text-gray-700 mb-4">
          <p>{article.content}</p>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Author: {article.author.firstName} {article.author.lastName}</p>
          <p>Published: {new Date(article.createdAt).toLocaleDateString()}</p>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              Tags: {article.tags.map(tag => (
                <span key={tag} className="bg-gray-100 px-2 py-1 rounded-md text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 text-sm text-gray-600 mb-4">
          <span>👍 {article.likes.length} Likes</span>
          <span>👎 {article.dislikes.length} Dislikes</span>
        </div>
        
        {!isOwner && (
          <div className="flex space-x-2">
            <button 
              onClick={onLike}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Like
            </button>
            <button 
              onClick={onDislike}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Dislike
            </button>
            <button 
              onClick={onBlock}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleModal;