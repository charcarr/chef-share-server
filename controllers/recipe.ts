const RecipeDB = require('../models/recipe');
import { EditOptions, Recipe } from '../lib/index';
import { Request, Response } from 'express';

const deleteRecipe = async (req: Request, res: Response) => {
  const recipeId: string = req.params.recipeId;
  try {
    await RecipeDB.deleteOne({ _id: recipeId });
    res.status(200).send('successfully deleted');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const addFromFriend = async (req: Request, res: Response) => {
  const userId: string = req.body._id;
  const recipe: Recipe = req.body.recipe;
  // check if recipe was already added;
  const recipes = await RecipeDB.findOne({
    userID: userId,
    recipeOriginID: recipe._id,
  });
  if (recipes) return res.status(409).send('Recipe already added!');
  const recipeCopy: any = {
    ...recipe,
    userID: userId,
    recipeOriginID: recipe._id,
  };
  delete recipeCopy._id;
  try {
    const newRecipe = new RecipeDB(recipeCopy);
    await newRecipe.save();
    res.status(201).send('success');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const editRecipe = async (req: Request, res: Response) => {
  const recipeId: string = req.body.id;
  const editAction: string = req.params.editAction;
  const payload: string = req.body.payload;

  let options: EditOptions = {
    nameChange: { $set: { name: payload } },
    addNote: { $push: { notes: payload } },
    deleteNote: { $pull: { notes: { id: payload } } },
  };

  try {
    await RecipeDB.findOneAndUpdate({ _id: recipeId }, options[editAction], {
      new: true,
      safe: true,
    });
    res.status(200).send('successfully updated');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

module.exports = { deleteRecipe, addFromFriend, editRecipe };
