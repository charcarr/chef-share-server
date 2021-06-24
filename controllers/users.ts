import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { UserCreateInput, UserDB, RawUser, LoginInput } from '../lib/index';
const RecipeDB = require('../models/recipe');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  validateToken,
  invalidateToken,
} = require('../middlewares/tokenValidation');
require('dotenv').config();

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username }: UserCreateInput = req.body;

    if (!(email && password && username)) {
      return res.status(400).send('invalid request');
    }
    if (await User.findOne({ email }).exec()) {
      return res.status(409).send('user already exists!');
    }
    if (await User.findOne({ username }).exec()) {
      return res.status(409).send('this username is taken');
    }

    // create user
    const hashedPassword: string = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(10)
    );
    const newUser: Document<RawUser> = await new User({
      email,
      password: hashedPassword,
      username,
    });
    newUser.save();
    // send back access token
    let token: string = jwt.sign({ _id: newUser._id }, SECRET_KEY, {
      expiresIn: '3h',
    });
    await validateToken(token);
    res.status(201).json({ accessToken: token });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body;
    if (!email || !password) {
      return res.status(400).end('username and password are required');
    }
    let user: UserDB | undefined = await User.findOne({ email }).exec();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(403).end('invalid username or password');
    }

    // send back access token
    let token: string = jwt.sign({ _id: user._id }, SECRET_KEY, {
      expiresIn: '3h',
    });
    await validateToken(token);
    res.status(200).json({ accessToken: token });
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

const profile = async (req: Request, res: Response) => {
  try {
    let user: UserDB | undefined = await User.findById(req.body._id)
      .select('-password')
      .lean();
    if (!user) return res.status(404).send('User does not exist');
    const recipesFromUser = await RecipeDB.find({ userID: req.body._id });
    user.recipeStore = recipesFromUser;
    res.status(200).json(user);
  } catch (e) {
    res.status(500).send('Internal Server Error!');
  }
};

const logout = async (req: Request, res: Response) => {
  const token: string | undefined = req?.headers?.authorization?.split(' ')[1];
  await invalidateToken(token);
  res.status(200).send('logout successful');
};

const getAllButMe = async (req: Request, res: Response) => {
  try {
    const allButMe: UserDB[] | [] = await User.find({
      _id: { $nin: [ObjectID(req.body._id)] },
    }).select('username -_id');
    const usernames = allButMe.map((otherUser) => otherUser.username);
    res.status(200).json(usernames);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

const getFriendStore = async (req: Request, res: Response) => {
  try {
    const user: UserDB | undefined = await User.findOne({
      username: req.body.username,
    }).lean();
    if (!user) return res.status(400).send('User does not exist!');
    const recipesFromUser = await RecipeDB.find({ userID: user._id }).lean();
    res.status(200).json(recipesFromUser);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createUser,
  getAllButMe,
  login,
  logout,
  profile,
  getFriendStore,
};
