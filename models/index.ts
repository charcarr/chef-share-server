//eslint-disable-next-line @typescript-eslint/ban-ts-comment     // @ts-ignore
const mongoose = require('mongoose');

const { DB_CONN } = process.env;

mongoose.connect(
  DB_CONN,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err: any) => {
    if (err) {
      console.log(`😞 can't connect to db, something went wrong! ${err}`);
    } else {
      console.log(`🦆 database connected!`);
    }
  }
);

module.exports = mongoose;
