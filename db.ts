import { connect, Mongoose } from 'mongoose';

const bootDB = async (connectionString: string): Promise<Mongoose | undefined> => {
  try {
    const connection = await connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log('🦆 database connected!');
    return connection;
  } catch (error) {
    console.log('[Database connection error]:\n', error);
  }
}

export default bootDB;