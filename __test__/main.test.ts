import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db';
import { seedDB } from '../__seed__';
import { UserEntry } from '../models/user';

const port = Number(process.env.TEST_PORT);
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
  })
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
})

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


afterAll(async () => {
  await db?.connection.close();
  server?.close();
});