import cheerio from 'cheerio';
import fetch from 'node-fetch';
import _ from 'lodash';
import User from '../models/user';
import uuid from 'uuid';


const fetchWithTimeout = (url, options, timeout = 5000) => {
  return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
      )
  ]);
}

const fetchHtml = (url) => {
  return fetchWithTimeout(url).then(res => res.text());
}

const parseHtml = (html) => {
  const $ = cheerio.load(html);
  const jsonld = $('script[type="application/ld+json"]').html();
  if (!jsonld) return false;
  const recipe = JSON.parse(jsonld);

  let nestedRecipe = {};
  if (!recipe.hasOwnProperty('recipeIngredient')) {
    console.log('i was nested');
    if (Array.isArray(recipe)){
      nestedRecipe = recipe.filter(obj => obj['@type'] === 'Recipe')[0];
    } else if (nestedRecipe !== {}) {
      nestedRecipe = recipe['@graph'].filter(obj => obj['@type'] === 'Recipe')[0];
    }
  }

  if (recipe.recipeIngredient) {
    return recipe;
  } else if (nestedRecipe.recipeIngredient) {
    return nestedRecipe;
  } else {
    return false;
  }
}

const extractData = (jsonld) => {
  desiredKeys = ['name','keywords','recipeYield', 'recipeIngredient','image', 'recipeInstructions', 'publisher', 'author']
  const recipe = {}

  for (key of desiredKeys) {
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
        recipe[key] = jsonld[key].map(obj => obj.text);

      } else if (key === 'publisher') {
        if (jsonld[key].hasOwnProperty('name')) recipe[key] = jsonld[key].name;

      } else if (key === 'author') {
        if (Array.isArray(jsonld[key])) {
          recipe[key] = jsonld[key].map(obj => obj.name).join(',');
        } else if (jsonld[key].hasOwnProperty('name')) {
          recipe[key] = jsonld[key].name;
        }

      } else {
        recipe[key] = jsonld[key]
      }
    }
  }

  return recipe;
}


const handleScrape = async (req, res) => {
  try {
    const html = await fetchHtml(req.body.url);
    const jsonld = parseHtml(html);
    if(!jsonld) throw new Error('no json ld');

    const recipe = extractData(jsonld);
    recipe.url = req.body.url;
    recipe.id = uuid.v4();
    recipe.notes = [];

    const user = await User.findById(req.body._id);
    recipe.origin = user.username;

    // save to user document
    await User.findByIdAndUpdate(req.body._id, {$push: {recipeStore: recipe}}, {new: true});
    res.status(200).json(recipe);

  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }

}

export default { handleScrape};
