import User from "../models/user";
import { Request, Response } from "express";

const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body._id;
  const recipeId = req.body.id;

  try {
    await User.findByIdAndUpdate(userId,
      {$pull: {'recipeStore': {id: recipeId}}}
    );
    res.status(200).send('successfully deleted');

  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}

const addFromFriend = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body._id;
  const recipe = req.body.recipe;

  try {
    await User.findByIdAndUpdate(userId,
      {$push: {'recipeStore': recipe }}
    );
    res.status(204).send('success');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }

}


const editRecipe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body._id;
  const recipeId = req.body.id
  const editAction = req.params.editAction;

  let options = {
    'nameChange': {$set: {'recipeStore.$.name': req.body.payload}},
    'addNote': {$push: {'recipeStore.$.notes': req.body.payload}},
    'deleteNote':{$pull: {'recipeStore.$.notes': {id: req.body.payload}}},
  }

  try {
    await User.findOneAndUpdate(
      { _id: userId, recipeStore: { $elemMatch: { id: recipeId } } },
      options[editAction],
      /* @ts-ignore */
      { 'new': true, 'safe': true }
    );
    res.status(200).send('successfully updated');

  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}


export default { deleteRecipe, addFromFriend, editRecipe };


