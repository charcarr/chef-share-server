import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db';
import { seedDB } from '../__seed__';
import { UserEntry } from '../models/user';
import faker from 'faker';

const port = Number(process.env.TEST_PORT);
// *****
// * ENSURE TEST_DB_CONN POINTS TO TEST DATABASE
// * DATABASE IS ERASED AND RESEEDED PRIOR TO RUNNING TESTS!
// *****
const connectionString = String(process.env.TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;
let mockUsers: UserEntry[];

interface MockUser {
  email?: string;
  password?: string;
  username?: string;
  accessToken?: string;
}

const newUser: MockUser = {
  email: 'charley@chefshare.com',
  password: 'password123',
  username: 'charcarr'
};

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    await db.connection.db.dropDatabase();
    mockUsers = await seedDB(db);
  }
  server = bootServer(port);
});

test('Mock users must be present', () => {
  expect(mockUsers).toHaveLength(25);
  expect(mockUsers[0].recipeStore).toHaveLength(4);
  expect(mockUsers[0].recipeStore[0].notes).toHaveLength(2);
});

describe('POST /signup', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/signup');
  });

  test('Returns 400 for missing data', async () => {
    const response = await endpoint.send({});
    expect(response.status).toBe(400);
  });

  test('Returns a token for a new user', async () => {
    const response = await endpoint.send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
  });

  test('Returns 403 if email already exists', async () => {
    const response = await endpoint.send(newUser);
    expect(response.status).toBe(403);
  });

  test('Return 409 if username already exists', async () => {
    const sameUsername: MockUser = {
      email: 'char@chefshare.com',
      password: 'password123',
      username: 'charcarr'
    };
    const response = await endpoint.send(sameUsername);
    expect(response.status).toBe(409);
  });
});

describe('POST /login', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/login');
  });

  test('Returns 400 for missing data', async () => {
    const response = await endpoint.send({});
    expect(response.status).toBe(400);
  });

  test('Return 403 for invalid password', async () => {
    const userWrongPass: MockUser = {
      email: 'charley@chefshare.com',
      password: 'password123a',
    };

    const response = await endpoint.send(userWrongPass);
    expect(response.status).toBe(403);
  });

  test('Returns a token for a valid user', async () => {
    const userCorrectPass: MockUser = {
      email: 'charley@chefshare.com',
      password: 'password123',
    };

    const response = await endpoint.send(userCorrectPass);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    newUser.accessToken = response.body.accessToken;
  });
});

describe('GET /logout', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).get('/logout');
  });

  test('Returns 401 for invalid token to logout', async () => {
    // Status 401 is returned from auth middleware
    const response = await endpoint.set('Authorization', 'Bearer: badToken');
    expect(response.status).toBe(401);
  });

  test('Should logout with correct token', async () => {
    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(response.status).toBe(200);
  });
});

describe('GET /profile', () => {
  let endpoint: Test;

  beforeEach( async() => {
    endpoint = request(server).get('/profile');
    const userCorrectPass: MockUser = {
      email: 'charley@chefshare.com',
      password: 'password123',
    };

    const response = await request(server).post('/login').send(userCorrectPass);
    newUser.accessToken = response.body.accessToken;
  });

  test('Return 200 if you find a user', async() => {
    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(response.status).toBe(200);
  });
});

describe('GET /users', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).get('/users');
  });

  test('Returns all users except for current user', async () => {
    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(25);
  });
});

describe('POST /getFriendStore', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/getFriendStore');
  });

  test('Returns a Recipe Store for a valid user', async () => {
    const user: MockUser = {
      username: mockUsers[0].username,
    };

    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken).send(user);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0]).toHaveProperty('recipeYield');
  });
});

describe('POST /scrape', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/scrape');
  });

  test('Should create and store a recipe from a url', async () => {
    const url: string = 'https://www.bonappetit.com/recipe/french-toast-waffles';
    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken).send({url});
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('recipeIngredient');
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('notes');
    expect(response.body).toHaveProperty('origin');
    expect(response.body.url).toBe(url);
  });
});

describe('POST /editRecipe/:editAction', () => {
  test('Should change recipe name', async () => {
    const { body } = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    const editBody = { id: body.recipeStore[0].id, payload: 'Sunday waffles' };
    const response = await request(server)
      .post('/editRecipe/nameChange')
      .set('Authorization', 'Bearer: ' + newUser.accessToken)
      .send(editBody);

    expect(response.status).toBe(200);
    const newResponse = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(newResponse.body.recipeStore[0].name).toBe('Sunday waffles');
  });

  test('Should add recipe note', async () => {
    const { body } = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    const newNote = { id: faker.datatype.uuid(), text: 'Waffles for hangovers only' };
    const editBody = { id: body.recipeStore[0].id, payload: newNote };
    const response = await request(server)
      .post('/editRecipe/addNote')
      .set('Authorization', 'Bearer: ' + newUser.accessToken)
      .send(editBody);

    expect(response.status).toBe(200);
    const newResponse = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(newResponse.body.recipeStore[0].notes[0].text).toBe('Waffles for hangovers only');
  });

  test('Should delete recipe note', async () => {
    const { body } = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    const editBody = { id: body.recipeStore[0].id, payload: body.recipeStore[0].notes[0].id };
    const response = await request(server)
      .post('/editRecipe/deleteNote')
      .set('Authorization', 'Bearer: ' + newUser.accessToken)
      .send(editBody);

    expect(response.status).toBe(200);
    const newResponse = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(newResponse.body.recipeStore[0].notes).toHaveLength(0);
  });
});

describe('POST /addFromFriend', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/addFromFriend');
  });

  test('Should add recipe to user', async () => {
    const friendRecipe = { recipe: mockUsers[0].recipeStore[0] };
    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken).send(friendRecipe);
    expect(response.status).toBe(204);
    const newResponse = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(newResponse.body.recipeStore[1].id).toBe(mockUsers[0].recipeStore[0].id);
  });
});

describe('POST /deleteRecipe', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/deleteRecipe');
  });

  test('Should delete recipe from user recipe store', async () => {
    const recipeToDelete = { id: mockUsers[0].recipeStore[0].id };
    const response = await endpoint.set('Authorization', 'Bearer: ' + newUser.accessToken).send(recipeToDelete);
    expect(response.status).toBe(200);
    const newResponse = await request(server).get('/profile').set('Authorization', 'Bearer: ' + newUser.accessToken);
    expect(newResponse.body.recipeStore).toHaveLength(1);
  });
});

afterAll(async () => {
  await db?.connection.close();
  server?.close();
});
