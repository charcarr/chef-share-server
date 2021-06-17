const express = require('express');
const userController = require('./controllers/users');
const recipeScrapingController = require('./controllers/recipeScraper');
const recipeController = require('./controllers/recipe');
const authMiddleware = require('./middlewares/auth');

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

module.exports = router;