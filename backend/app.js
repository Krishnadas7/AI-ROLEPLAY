import express from "express";
import cors from "cors";
import morgan from "morgan";
import roleplayRoutes from "./routes/roleplayRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://ai-roleplay-1.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1", roleplayRoutes);
app.use("/api/v1/session", sessionRoutes);
app.use("/api/v1/user", userRoutes);

app.get("/api/v1/health", (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

export default app;