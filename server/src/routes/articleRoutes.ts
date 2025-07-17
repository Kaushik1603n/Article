import express from 'express';
import { article, uploadMiddleware,getArticle, handleReaction,setPreferences, editArticle,deleteArticle } from '../controllers/articleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const articleRoute = express.Router();

articleRoute.post('/article',authMiddleware,uploadMiddleware, article);
articleRoute.put('/article/:id',authMiddleware,uploadMiddleware, editArticle);
articleRoute.delete('/article/:id',authMiddleware,uploadMiddleware, deleteArticle);
articleRoute.get('/article',authMiddleware, getArticle);
articleRoute.put('/:articleId/reaction', authMiddleware, handleReaction);
articleRoute.put('/preferences', authMiddleware, setPreferences);


export default articleRoute;