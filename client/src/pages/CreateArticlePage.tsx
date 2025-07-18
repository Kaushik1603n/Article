import React, { useEffect, useState } from 'react';
import { Camera, X, Plus, Eye, Tag, Folder, FileText, ImageIcon } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import type { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ArticleData {
    name: string;
    description: string;
    content: string;
    image: File | null;
    tags: string[];
    category: string;
}

const CreateArticlePage = () => {
    const [articleData, setArticleData] = useState<ArticleData>({
        name: '',
        description: '',
        content: '',
        image: null,
        tags: [],
        category: ''
    });

    const [currentTag, setCurrentTag] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();


    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
    }, [])

    const categories = [
        'technology', 'health', 'sports',
        'entertainment', 'politics', 'space'
    ];

    const handleInputChange = (field: keyof ArticleData, value: string) => {
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
            image: file
        }));

        if (errors.image) {
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const removeImage = () => {
        setArticleData(prev => ({
            ...prev,
            image: null
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
            if (user?._id) {
                formData.append('userId', user._id);
            } else {
                navigate('/login');
                return;
            }
            formData.append('name', articleData.name);
            formData.append('description', articleData.description);
            formData.append('content', articleData.content);
            formData.append('category', articleData.category);
            articleData.tags.forEach(tag => formData.append('tags[]', tag));

            if (articleData.image) {
                formData.append('image', articleData.image);
            }
            console.log(articleData.image);
            console.log(formData);

            await axiosClient.post('/articles/article', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setArticleData({
                name: '',
                description: '',
                content: '',
                image: null,
                tags: [],
                category: ''
            });

            toast.success("Article Created")

        } catch (error) {
            console.error('Error submitting article:', error);
            toast.error('There was an error submitting your article. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Article</h1>
                            <p className="text-gray-600">Share your thoughts and ideas with the world</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="space-y-8">
                        <div>
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                                <FileText size={20} />
                                Article Title
                            </label>
                            <input
                                type="text"
                                value={articleData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter an engaging title for your article..."
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
                                placeholder="Write a compelling description that summarizes your article..."
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
                                placeholder="Write your article content here..."
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
                                    placeholder="Add tags to help readers find your article..."
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

                            {articleData.image && (
                                <div className="mt-4">
                                    <div className="relative group max-w-md">
                                        <img
                                            src={URL.createObjectURL(articleData.image)}
                                            alt="Upload preview"
                                            className="w-full h-64 object-contain rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={18} />
                                        </button>
                                        <div className="mt-2 text-sm text-gray-600">
                                            {articleData.image.name} ({(articleData.image.size / 1024).toFixed(2)} KB)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            'Publishing...'
                        ) : (
                            <>
                                <Eye size={18} />
                                Publish Article
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateArticlePage;