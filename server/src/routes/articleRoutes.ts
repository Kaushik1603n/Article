import express from 'express';
import { article, uploadMiddleware,getArticle, handleReaction,setPreferences, editArticle,deleteArticle } from '../controllers/articleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const articleRoute = express.Router();

articleRoute.post('/article',uploadMiddleware, article);
articleRoute.put('/article/:id/:userId',uploadMiddleware, editArticle);
articleRoute.delete('/article/:id/:userId', deleteArticle);
articleRoute.get('/article/:userId', getArticle);
articleRoute.put('/:articleId/reaction/:userId', handleReaction);
articleRoute.put('/preferences/:userId', setPreferences);


export default articleRoute;