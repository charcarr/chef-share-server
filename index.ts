import bootServer from "./server";
import bootDB from "./db";

const port = Number(process.env.PORT);
const { DB_CONN } = process.env;

bootDB(DB_CONN);
bootServer(port);
