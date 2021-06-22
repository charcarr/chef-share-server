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

interface MockNewUser {
  email: string,
  password: string,
  username?: string
}

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

describe.skip('POST /signup', () => {
  let endpoint: Test;
  const newUser: MockNewUser = {
    email: 'charley@chefshare.com',
    password: 'password123',
    username: 'charcarr'
  };

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
    const sameUsername: MockNewUser = {
      email: 'char@chefshare.com',
      password: 'password123',
      username: 'charcarr'
    };
    const response = await endpoint.send(sameUsername);
    expect(response.status).toBe(409);
  })
});

describe.skip('POST /login', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/login');
  });

  test('Returns 400 for missing data', async () => {
    const response = await endpoint.send({});
    expect(response.status).toBe(400);
  });

  test('Return 403 for invalid password', async () => {
    const userWrongPass: MockNewUser = {
      email: 'charley@chefshare.com',
      password: 'password123a',
    };
    const response = await endpoint.send({userWrongPass});
    expect(response.status).toBe(403);
  });

  test('Returns a token for a valid user', async () => {
    const userCorrectPass: MockNewUser = {
      email: 'charley@chefshare.com',
      password: 'password123',
    };
    const response = await endpoint.send(userCorrectPass);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

});

afterAll(async () => {
  await db?.connection.close();
  server?.close();
});