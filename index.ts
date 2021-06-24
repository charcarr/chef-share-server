const { bootDB } = require('./models/index');
const { bootServer } = require('./server');

require('dotenv').config();

const PORT = process.env.PORT;
const connectionString = process.env.DB_CONN;

bootDB(connectionString);
bootServer(PORT);
