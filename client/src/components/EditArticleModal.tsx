import React, { useEffect, useState } from 'react';
import { Camera, X, Plus, Tag, Folder, FileText, ImageIcon, Loader } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import type { Article, User } from '../types';
import { toast } from 'react-toastify';

interface EditArticleModalProps {
  article: Article;
  onClose: () => void;
  onUpdate: (updatedArticle: Article) => void;
}

const EditArticleModal: React.FC<EditArticleModalProps> = ({ article, onClose, onUpdate }) => {
  const [articleData, setArticleData] = useState({
    name: article.title || '',
    description: article.description || '',
    content: article.content || '',
    image: null as File | null,
    tags: article.tags || [],
    category: article.category || '',
    existingImageUrl: article.imageUrl || ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [])

  const categories = [
    'technology', 'health', 'sports',
    'entertainment', 'politics', 'space'
  ];

  useEffect(() => {
    // Load initial data
    setIsLoading(false);
  }, []);

  const handleInputChange = (field: keyof typeof articleData, value: string) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }

    setArticleData(prev => ({
      ...prev,
      image: file,
      existingImageUrl: '' // Clear existing image URL when new image is uploaded
    }));

    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setArticleData(prev => ({
      ...prev,
      image: null,
      existingImageUrl: '' // Clear both image and existing image URL
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !articleData.tags.includes(currentTag.trim())) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!articleData.name.trim()) newErrors.name = 'Article name is required';
    if (!articleData.description.trim()) newErrors.description = 'Description is required';
    if (!articleData.content.trim()) newErrors.content = 'Content is required';
    if (!articleData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', articleData.name);
      formData.append('description', articleData.description);
      formData.append('content', articleData.content);
      formData.append('category', articleData.category);
      articleData.tags.forEach(tag => formData.append('tags[]', tag));

      if (articleData.image) {
        formData.append('image', articleData.image);
      }

      const response = await axiosClient.put(`/articles/article/${article._id}/${user?._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      onUpdate(response.data);
      toast.success("Article updated successfully");
      onClose();
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('There was an error updating your article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <Loader className="animate-spin mx-auto" size={48} />
          <p className="text-center mt-4">Loading article data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Article</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <FileText size={20} />
              Article Title
            </label>
            <input
              type="text"
              value={articleData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <FileText size={20} />
              Description
            </label>
            <textarea
              value={articleData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <FileText size={20} />
              Article Content
            </label>
            <textarea
              value={articleData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={12}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${errors.content ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Folder size={20} />
              Category
            </label>
            <select
              value={articleData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
            >
              <option value="">Select a category...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Tag size={20} />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {articleData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {articleData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <ImageIcon size={20} />
              Featured Image
            </label>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Camera size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop an image here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  click to browse
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Support for JPG, PNG, GIF up to 5MB (one image only)
              </p>
            </div>

            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}

            {(articleData.existingImageUrl || articleData.image) && (
              <div className="mt-4">
                <div className="relative group max-w-md">
                  <img
                    src={articleData.image ? URL.createObjectURL(articleData.image) : articleData.existingImageUrl}
                    alt="Article preview"
                    className="w-full h-64 object-contain rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                  {articleData.image && (
                    <div className="mt-2 text-sm text-gray-600">
                      {articleData.image.name} ({(articleData.image.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" size={18} />
                Updating...
              </>
            ) : (
              'Update Article'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditArticleModal;