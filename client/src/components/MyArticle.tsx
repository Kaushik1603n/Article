import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import axios from "axios";
import type { Article, User } from "../types";
import { toast } from "react-toastify";
import MyArticleCard from "./MyArticleCard";
import EditArticleModal from "./EditArticleModal";

function MyArticle() {
  const [feedArticles, setFeedArticles] = useState<Article[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [])


  const fetchArticles = async () => {
    try {
      const feedResponse = await axiosClient.get(`/articles/article/${user?._id}`);
      setFeedArticles(feedResponse.data?.feed || []);

    } catch (err) {
      let errorMessage = 'Failed to load articles';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
        toast.error(errorMessage)
      }
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEditArticle = async (article: Article) => {
    setCurrentArticle(article);
    setIsEditModalOpen(true);
  }

  const handleArticleUpdate = (updatedArticle: Article) => {
    setFeedArticles(prev => prev.map(article =>
      article._id === updatedArticle._id ? updatedArticle : article
    ));
    setIsEditModalOpen(false);
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await axiosClient.delete(`/articles/article/${id}/${user?._id}`)
      fetchArticles();
      toast.success("Article deleted successfully")

    } catch (err) {
      let errorMessage = 'Failed to delete articles';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
        toast.error(errorMessage)
      }
    }

  }
  return (
    <div>
      {feedArticles.length === 0 ? (
        <p className="text-gray-600">No articles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedArticles && feedArticles.map(article => (
            <MyArticleCard
              article={article}
              onEdit={(article) => handleEditArticle(article)}
              onDelete={(id) => handleDeleteArticle(id)}
            />
          ))}
        </div>
      )}

      {isEditModalOpen && currentArticle && (
        <EditArticleModal
          article={currentArticle}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleArticleUpdate}
        />
      )}

    </div>
  )
}

export default MyArticle
