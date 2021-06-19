import express from 'express';
import userController from './controllers/users';
import recipeScrapingController from './controllers/recipeScraper';
import recipeController from './controllers/recipe';
import authMiddleware from './middlewares/auth';

const router = express.Router();

router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);
router.get('/profile', authMiddleware, userController.profile);
router.get('/users', authMiddleware, userController.getAllButMe);
router.post('/getFriendStore', authMiddleware, userController.getFriendStore);

router.post('/scrape', authMiddleware, recipeScrapingController.handleScrape);
router.post('/deleteRecipe', authMiddleware, recipeController.deleteRecipe);
router.post('/addFromFriend', authMiddleware, recipeController.addFromFriend);
router.post('/editRecipe/:editAction', authMiddleware, recipeController.editRecipe);

export default router;
