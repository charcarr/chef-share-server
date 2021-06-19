import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { validateToken, invalidateToken } from '../middlewares/tokenValidation';

const SECRET_KEY = process.env.SECRET_KEY;

const createUser = async (req, res) => {
  try {
    const {email, password, username} = req.body;

    if (!(email && password && username)) {
      return res.status(400).send('invalid request');
    }
    if (await User.findOne({email}).exec()) {
      return res.status(403).send('user already exists!');
    }
    if (await User.findOne({username}).exec()) {
      return res.status(409).send('this username is taken');
    }

    // create user
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    console.log(hashedPassword);
    const newUser = await new User({email, password: hashedPassword, username});
    newUser.save();
    // send back access token
    let token = jwt.sign({_id: newUser._id}, SECRET_KEY, {expiresIn: '3h'});
    validateToken(token);
    res.status(201).json({accessToken: token});

  } catch (e) {
    console.log(e)
    res.status(403).send(e);
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).end('username and password are required');
  }
  const user = await User.findOne({ email }).exec();
  console.log(bcrypt.compareSync(password, user.password));
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).end('invalid username or password');
  }

  // send back access token
  const token = jwt.sign({_id: user._id}, SECRET_KEY, {expiresIn: '3h'});
  validateToken(token);
  res.status(200).json({accessToken: token});
}


const profile = async (req, res) => {
  const user = await User.findById(req.body._id);
  if(user) {
    res.status(200).json(user);
  } else {
    res.sendStatus(400);
  }
}

const logout = async (req, res) => {
   token = req.headers['authorization'].split(' ')[1];
   invalidateToken(token);
   res.status(200).send('logout successful');
}


const getAllButMe = async (req, res) => {
  try {
    const users = await User.find();
    const allButMe = users.filter(user => user.id !== req.body._id);
    const usernames = allButMe.map(user => user.username);
    res.status(200).json(usernames);
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
}

const getFriendStore = async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (user) {
      res.status(200).json(user.recipeStore);
    } else {
      throw new Error ('user not found');
    }
  } catch (e) {
    res.status(400).send(e);
  }

}


export default { createUser, getAllButMe, login, logout, profile, getFriendStore };