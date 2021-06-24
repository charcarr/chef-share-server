import { Request, Response } from 'express';
import http from 'http';
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const router = require('./router.ts');

const bootServer = (port: string): http.Server => {
  const app = express();

  app
    .use(morgan('dev'))
    .use(cors())
    .use(express.json())
    .use(router)
    .get('/', (_: Request, res: Response) => {
      res.status(200).send('Hello, stranger!');
    })
    .get('*', (_: Request, res: Response) => {
      res.status(404).send('Sorry, not found 😞');
    });

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Server is running on port:${port}`);
  });

  return server;
};

module.exports = {
  bootServer,
};
