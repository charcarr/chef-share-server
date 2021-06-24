import { Model, Schema, model } from 'mongoose';

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

export interface UserEntry {
  email: string;
  password: string;
  username: string;
  recipeStore: recipe[];
}

const userSchema = new Schema<UserEntry>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  recipeStore: {
    type: Array,
    required: false,
    default: [],
  },
});

const User: Model<UserEntry> = model('User', userSchema);

export default User;
