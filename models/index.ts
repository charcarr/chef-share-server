import mongoose from 'mongoose';
const { DB_CONN } = process.env;

mongoose.connect(
   DB_CONN,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error: any) => {
    if (error) {
      console.log(`😞 can't connet to db, something went wrong! ${error}`);
    } else {
      console.log(`🦆 database connected!`);
    }
  }
);

export default mongoose;