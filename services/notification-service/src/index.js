import express from "express";
import cors from "cors";
import { env } from "./config/environments.js";
import connectDB from "./config/mongodb.js";
import { API } from "./routes/index.js";
import { metricsHandler, metricsMiddleware } from "./middlewares/metrics.js";
import { requestLogger } from "./middlewares/requestLogger.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(requestLogger);
app.use(metricsMiddleware);
app.get("/metrics", metricsHandler);
app.use("/", API);

const PORT = env.PORT || 5004;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Notification service listening on http://localhost:${PORT}`);
});
