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
  _id: string;
  notes: Note[];
  origin: string;
  url: string;
  recipeOriginID?: string;
}
interface RecipeDB extends ExtractedRecipe {
  userID: string;
  notes: Note[];
  origin: string;
  url: string;
  _id?: string;
  recipeOriginID?: string;
}

interface LoginInput {
  email: string | undefined;
  password: string | undefined;
}

interface RawUser {
  email: string;
  password: string;
  username: string;
}

interface UserDB extends RawUser {
  _id: string;
  __v: number;
  recipeStore?: Recipe[];
}

interface UserCreateInput {
  email: string | undefined;
  password: string | undefined;
  username: string | undefined;
}

export {
  EditOptions,
  Recipe,
  ExtractedRecipe,
  UserDB,
  UserCreateInput,
  RawUser,
  LoginInput,
  RecipeDB,
};
