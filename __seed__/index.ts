import { Mongoose } from 'mongoose';
import faker from 'faker';
import bcrypt from 'bcrypt';
import { UserEntry } from '../models/user';

export const seedDB = async (db: Mongoose): Promise<UserEntry[]> => {
  const users: UserEntry[] = Array.from({ length: 25 }, () => ({
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.internet.userName(),
    recipeStore: Array.from({ length: 4 }, () => ({
      id: faker.datatype.uuid(),
      name: faker.lorem.words(3),
      keywords: Array.from({ length: 3 }, () => faker.lorem.word()),
      image: faker.internet.url(),
      recipeYield: 'Serves ' + faker.datatype.number(4).toString(),
      recipeIngredient: Array.from({ length: 5 }, () => faker.lorem.words(2)),
      recipeInstructions: Array.from({ length: 5 }, () => faker.lorem.words(6)),
      publisher: faker.name.findName(),
      author: faker.name.findName(),
      url: faker.internet.url(),
      notes: Array.from({ length: 2 }, () => ({
        id: faker.datatype.uuid(),
        text: faker.lorem.sentence()
      })),
      origin: faker.internet.url()
    }))
  }));
  await db.connection.models.User.insertMany(users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 10)
  })));

  return users;
}
