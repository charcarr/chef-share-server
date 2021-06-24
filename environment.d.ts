declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_CONN: string;
      PORT: string;
      SECRET_KEY: string;
    }
  }
}

export {};
