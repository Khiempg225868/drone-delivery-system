import express from "express";
import cors from 'cors';
import { env } from "./config/environments.js";
import connectDB from "./config/mongodb.js";
import { API } from "./routes/index.js";

const app = express();

// ✅ CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use("/", API);

const PORT = env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});