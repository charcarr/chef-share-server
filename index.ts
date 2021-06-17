import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
require('dotenv').config();

import router from './router';

const { PORT } = process.env;

const app = express();

app
  .use(morgan('dev'))
  .use(cors())
  .use(express.json())
  .use(router)
  .get('/', (_: any, res: any) => {
    res.status(200).send('Hello, stranger!');
  })
  .get('*', (_: any, res: any) => {
    res.status(404).send('Sorry, not found 😞');
  })
  .listen(PORT, () => {
    console.log(`🚀 server listening on port: ${PORT}`);
  });
