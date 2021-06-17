interface MongooseSpecification {
  [key: string]: string | { id: string };
}

interface MongooseAction {
  [key: string]: MongooseSpecification;
}
interface EditOptions {
  [key: string]: MongooseAction;
}

interface Note {
  id: string;
  text: string;
}

interface ExtractedRecipe {
  name: string;
  keywords: string[];
  image: string;
  recipeYield: string;
  recipeIngredient: string[];
  recipeInstructions: string[];
  author: string;
  publisher?: string;
}

interface Recipe extends ExtractedRecipe {
  id: string;
  notes: Note[];
  origin: string;
  url: string;
}

interface UserDB {
  _id: string;
  __v: number;
  email: string;
  password: string;
  username: string;
  recipeStore: Recipe[];
}

export { EditOptions, Recipe, ExtractedRecipe, UserDB };
