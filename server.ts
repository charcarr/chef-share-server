import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import router from './router';

const bootServer = (port: number): http.Server => {
  const app = express();

  app
	.use(morgan('dev'))
	.use(cors())
	.use(express.json())
	.use(router)
	.get('/', (_, res) => {res.status(200).send('Hello, stranger!')})
	.get('*', (_, res) => {res.status(404).send('Sorry, not found 😞')})

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`🚀 server listening on port: ${port}`);
  });

  return server;
}

export default bootServer;
