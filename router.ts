const express = require('express');

const router = express.Router();
const userController = require('./controllers/users.ts');
const recipeScrapingController = require('./controllers/recipeScraper.ts');
const recipeController = require('./controllers/recipe.ts');
const authMiddleware = require('./middlewares/auth.ts');

router.post('/signup', userController.createUser);
router.post('/login', userController.login);
router.get('/logout', authMiddleware, userController.logout);
router.get('/profile', authMiddleware, userController.profile);
router.get('/users', authMiddleware, userController.getAllButMe);
router.post('/getFriendStore', authMiddleware, userController.getFriendStore);

router.post('/scrape', authMiddleware, recipeScrapingController.handleScrape);
router.post(
  '/deleteRecipe/:recipeId',
  authMiddleware,
  recipeController.deleteRecipe
);
router.post('/addFromFriend', authMiddleware, recipeController.addFromFriend);
router.post(
  '/editRecipe/:editAction',
  authMiddleware,
  recipeController.editRecipe
);

module.exports = router;
