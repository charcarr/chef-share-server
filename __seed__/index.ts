import { Mongoose } from 'mongoose';
import faker from 'faker';
import bcrypt from 'bcrypt';
import { RawUser, RecipeDB, UserDB } from '../lib/index';

export interface DbSeedData {
  users: RawUser[];
  recipes: RecipeDB[];
}

export const random = (max: number): number => Math.floor(Math.random() * max);

export const seedDb = async (db: Mongoose): Promise<DbSeedData> => {
  const users: RawUser[] = Array.from({ length: 10 }, () => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }));
  await db.connection.models.User.insertMany(
    users.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }))
  );
  // Each user will have one recipe;
  let recipes: RecipeDB[] = [];
  for (let i = 0; i < users.length; i++) {
    const userDB: UserDB = await db.connection.models.User.findOne({
      email: users[i].email,
    });
    const recipe: RecipeDB = {
      keywords: Array.from({ length: Math.floor(Math.random() * 9) }, () =>
        faker.lorem.words()
      ),
      recipeIngredient: Array.from(
        { length: Math.floor(Math.random() * 9) },
        () => faker.lorem.sentence()
      ),
      recipeInstructions: Array.from(
        { length: Math.floor(Math.random() * 9) },
        () => faker.lorem.sentences()
      ),
      notes: [],
      name: faker.lorem.words(),
      recipeYield: '',
      image: faker.image.food(),
      author: faker.name.firstName(),
      url: faker.internet.url(),
      origin: users[i].username,
      userID: userDB._id,
    };
    recipes.push(recipe);
  }
  await db.connection.models.Recipe.insertMany(
    recipes.map((recipe) => ({ ...recipe }))
  );
  return { users, recipes };
};
