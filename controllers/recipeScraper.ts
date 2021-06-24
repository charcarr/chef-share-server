const cheerio = require('cheerio');
const fetch = require('node-fetch');
const uuid = require('uuid');
const User = require('../models/user');
const RecipeDB = require('../models/recipe');
import { Request, Response } from 'express';
import { ExtractedRecipe, Recipe, UserDB } from '../lib/index';

const fetchWithTimeout = (url: string, options?: any, timeout: number = 5000) =>
  Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    ),
  ]);

const fetchHtml = (url: string): Promise<any> =>
  fetchWithTimeout(url).then((res) => res.text());

const parseHtml = (html: any): any => {
  const $ = cheerio.load(html);
  const jsonld: any = $('script[type="application/ld+json"]').html();
  if (!jsonld) return false;
  const recipe: any = JSON.parse(jsonld);

  let nestedRecipe: any = {};
  if (!recipe.hasOwnProperty('recipeIngredient')) {
    if (Array.isArray(recipe)) {
      nestedRecipe = recipe.filter((obj: any) => obj['@type'] === 'Recipe')[0];
    } else if (nestedRecipe !== {}) {
      nestedRecipe = recipe['@graph'].filter(
        (obj: any) => obj['@type'] === 'Recipe'
      )[0];
    }
  }

  if (recipe.recipeIngredient) {
    return recipe;
  }
  if (nestedRecipe.recipeIngredient) {
    return nestedRecipe;
  }
  return false;
};

const extractData = (jsonld: any): ExtractedRecipe => {
  const desiredKeys: string[] = [
    'name',
    'keywords',
    'recipeYield',
    'recipeIngredient',
    'image',
    'recipeInstructions',
    'publisher',
    'author',
  ];
  let recipe: ExtractedRecipe = {} as ExtractedRecipe;

  for (let key of desiredKeys) {
    if (jsonld.hasOwnProperty(key)) {
      if (key === 'keywords' && typeof jsonld[key] === 'string') {
        recipe[key] = jsonld[key].split(',');
      } else if (key === 'image' && Array.isArray(jsonld[key])) {
        recipe[key] = jsonld[key][0];
      } else if (key === 'image' && jsonld[key].hasOwnProperty('url')) {
        recipe[key] = jsonld[key].url;
      } else if (key === 'recipeYield' && typeof jsonld[key] !== 'string') {
        recipe[key] = '';
      } else if (key === 'recipeInstructions') {
        recipe[key] = jsonld[key].map((obj: any) => obj.text);
      } else if (key === 'publisher') {
        if (jsonld[key].hasOwnProperty('name')) recipe[key] = jsonld[key].name;
      } else if (key === 'author') {
        if (Array.isArray(jsonld[key])) {
          recipe[key] = jsonld[key].map((obj: any) => obj.name).join(',');
        } else if (jsonld[key].hasOwnProperty('name')) {
          recipe[key] = jsonld[key].name;
        }
      } else if (
        key === 'recipeYield' ||
        key === 'keywords' ||
        key === 'image' ||
        key === 'name' ||
        key === 'recipeIngredient'
      ) {
        recipe[key] = jsonld[key];
      }
    }
  }

  return recipe;
};

const handleScrape = async (req: Request, res: Response) => {
  try {
    const url: string = req.body.url;
    const html: any = await fetchHtml(url);
    const jsonld: any = parseHtml(html);
    if (!jsonld) throw new Error('no json ld');

    let recipe: Recipe = extractData(jsonld) as Recipe;
    recipe.url = url;
    recipe.notes = [];

    const user: UserDB = await User.findById(req.body._id);
    recipe.origin = user.username;

    const newRecipe = new RecipeDB({ ...recipe, userID: req.body._id });
    await newRecipe.save();
    console.log(newRecipe);

    res.status(200).json(newRecipe);
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
};

module.exports = { handleScrape };
