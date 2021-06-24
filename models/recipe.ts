/* @ts-ignore */
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const recipeSchema = mongoose.Schema({
  userID: {
    type: ObjectID,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  keywords: {
    type: Array,
    required: true,
  },
  recipeYield: {
    type: String,
    required: false,
  },
  recipeIngredient: {
    type: Array,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  recipeInstructions: {
    type: Array,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  notes: {
    type: Array,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  recipeOriginID: {
    type: ObjectID,
    required: false,
  },
});

module.exports = mongoose.model('Recipe', recipeSchema);
