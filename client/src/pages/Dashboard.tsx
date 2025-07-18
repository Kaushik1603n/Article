import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Article, User } from "../types";
import ArticleCard from '../components/ArticleCard';
import PreferencesModal from '../components/PreferencesModal';
import ArticleModal from '../components/ArticleModal';
import axiosClient from '../utils/axiosClient';
import { toast } from 'react-toastify';
import {  BookOpen, Edit3, Loader, LogOut, Plus, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [feedArticles, setFeedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    const fetchArticles = async () => {
      setLoading(true);
      try {
        
        const feedResponse = await axiosClient.get(`/articles/article/${parsedUser?._id}`, {
          params: {
            preferences: parsedUser?.preferences
          },
          paramsSerializer: params => {
            return Object.entries(params)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
                }
                return `${key}=${encodeURIComponent(value)}`;
              })
              .join('&');
          }

        });
        setFeedArticles(feedResponse.data?.feed || []);
        

      } catch (err) {
        let errorMessage = 'Failed to load articles';

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [navigate]);

  const handleArticleInteraction = async (articleId: string, action: 'like' | 'dislike' | 'block') => {
    try {
      const response = await axiosClient.put(`/articles/${articleId}/reaction/${user?._id}`, { action });
      const updatedArticle = response.data;

      setFeedArticles(prev => prev.map(article =>
        article._id === articleId ? updatedArticle : article
      ));


      if (selectedArticle?._id === articleId) {
        setSelectedArticle(updatedArticle);
      }
    } catch (err) {
      let errorMessage = `Failed to ${action} article`;

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage || `Failed to ${action} article`);
    }
  };

  const handleUpdatePreferences = async (newPreferences: string[]) => {
    if (!user) return;

    try {
      const response = await axiosClient.put(`/articles/preferences/${user?._id}`, { preferences: newPreferences });
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowPrefsModal(false)

      setLoading(true);
      try {
        const feedResponse = await axiosClient.get(`/articles/article/${user?._id}`, {
          params: {
            preferences: newPreferences
          },
          paramsSerializer: params => {
            return Object.entries(params)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
                }
                return `${key}=${encodeURIComponent(value)}`;
              })
              .join('&');
          }

        });
        setFeedArticles(feedResponse.data?.feed);
        setShowPrefsModal(false);
      } catch (err) {
        let errorMessage = 'Failed to load articles';

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      let errorMessage = 'Failed to update preferences';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage || 'Failed to update preferences');
    }
  };

  const handleLike = async (articleId: string) => {
    try {
      const response = await axiosClient.put(`/articles/${articleId}/reaction/${user?._id}`, { action: "like" });
      const updatedArticle = response.data;

      setFeedArticles(prev => prev.map(article =>
        article._id === articleId ? updatedArticle : article
      ));


    } catch (err) {
      let errorMessage = 'Failed to like article';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage || 'Failed to like article');
    }

  };

  const handleDislike = async (articleId: string) => {
    try {
      const response = await axiosClient.put(`/articles/${articleId}/reaction/${user?._id}`, { action: "dislike" });
      const updatedArticle = response.data;

      setFeedArticles(prev => prev.map(article =>
        article._id === articleId ? updatedArticle : article
      ));


    } catch (err) {
      let errorMessage = 'Failed to dislike article';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage || 'Failed to dislike article');
    }
  };

  const handleBlock = async (articleId: string) => {
    try {
      const response = await axiosClient.put(`/articles/${articleId}/reaction/${user?._id}`, { action: "block" });
      const updatedArticle = response.data;

      setFeedArticles(prev => prev.map(article =>
        article._id === articleId ? updatedArticle : article
      ));


    } catch (err) {
      let errorMessage = 'Failed to block article';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage || 'Failed to block article');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axiosClient.post(`auth/logout`, {}, {
        withCredentials: true,
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };


  if (loading) return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <Loader className="animate-spin mx-auto" size={48} />
        <p className="text-center mt-4">Loading article data...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-center text-red-600 text-lg p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-sm text-gray-500">Discover amazing articles today</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPrefsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </button>

              <button
                onClick={() => navigate('/create-article')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto">
        <section className="mb-12 mt-6">
          {feedArticles.length === 0 ? (
            <p className="text-gray-600">No articles match your current preferences.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedArticles && feedArticles.map(article => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  currentUserId={user?._id}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onBlock={handleBlock}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showPrefsModal && user && (
        <PreferencesModal
          currentPreferences={user.preferences || []}
          onSave={handleUpdatePreferences}
          onClose={() => setShowPrefsModal(false)}
        />
      )}

      {showArticleModal && selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setShowArticleModal(false)}
          onLike={() => handleArticleInteraction(selectedArticle._id, 'like')}
          onDislike={() => handleArticleInteraction(selectedArticle._id, 'dislike')}
          onBlock={() => handleArticleInteraction(selectedArticle._id, 'block')}
          isOwner={selectedArticle.author._id === user?._id}
        />
      )}
    </div>
  );
};

export default Dashboard;