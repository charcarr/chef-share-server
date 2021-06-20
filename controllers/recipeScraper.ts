import cheerio from 'cheerio';
import fetch from 'node-fetch';
import _ from 'lodash';
import User from '../models/user';
import uuid from 'uuid';

interface recipeNote {
  id: string;
  text: string;
}

interface recipe {
  id: string;
  name: string;
  keywords: string[];
  image: string;
  recipeYield: string;
  recipeIngredient: string[];
  recipeInstructions: string[];
  publisher: string;
  author: string;
  url: string;
  notes: recipeNote[];
  origin: string;
}

interface RecipeResponse {
  name: string;
  keywords: string;
  image: {
    url: string;
  };
  recipeYield: string;
  recipeIngredient: string[];
  recipeInstructions: [{
    text: string;
  }];
  publisher: {
    name: string;
  };
  author: { name: string; }[];
}

type fetchOptions = Record<string, unknown>;
// type RecipeResponse = Record<string, unknown>;

const fetchWithTimeout = (url: string, options?: fetchOptions, timeout: number = 5000): Promise<Response | unknown> => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeout)
    )
  ]);
}

function isResponse(res: Response | unknown): res is Response {
  return (res as Response).text !== undefined;
}

const fetchHtml = (url: string): Promise<string | void> => {
  return fetchWithTimeout(url).then(res => {if (isResponse(res)) res.text()});
}

const parseHtml = (html: string): RecipeResponse | boolean => {
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

  if (recipe.hasOwnProperty('author')) {
    if (!Array.isArray(recipe.author) && typeof recipe.author === 'object') {
      recipe.author = [recipe.author];
    }
  }

  if (recipe.hasOwnProperty('recipeIngredient')) {
    return recipe;
  } else if (nestedRecipe.hasOwnProperty('recipeIngredient')) {
    return nestedRecipe as RecipeResponse;
  } else {
    return false;
  }
}

const extractData = (jsonld: RecipeResponse): Partial<recipe> => {
  const desiredKeys = ['name','keywords','recipeYield', 'recipeIngredient','image', 'recipeInstructions', 'publisher', 'author'];
  const recipe: Partial<recipe> = {};

  function authorIsArray(author: { name: string; }[] | { name: string; }): author is { name: string; }[] {
    return (author as { name: string; }[]).length !== undefined;
  }

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
        recipe[key] = jsonld[key].map(obj => obj.text);

      } else if (key === 'publisher') {
        if (jsonld[key].hasOwnProperty('name')) recipe[key] = jsonld[key].name;

      } else if (key === 'author') {
        // Will always be an array of objects now
        recipe[key] = jsonld[key].map(obj => obj.name).join(',');

      } else {
        recipe[key] = jsonld[key]
      }
    }
  }

  return recipe;
}

function isHtml(html: string | void): html is string {
  return html !== undefined;
}

function isJsonld(jsonld: RecipeResponse | boolean): jsonld is RecipeResponse {
  return jsonld !== false;
}

const handleScrape = async (req, res) => {
  try {
    const html = await fetchHtml(req.body.url);
    let jsonld: RecipeResponse;
    if (isHtml(html)){
      const jsonldRes = parseHtml(html);
      if (isJsonld(jsonldRes)) jsonld = jsonldRes;
    } else {
      throw new Error('no json ld');
    }

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

export default { handleScrape };
