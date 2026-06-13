import "dotenv/config";

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
};
