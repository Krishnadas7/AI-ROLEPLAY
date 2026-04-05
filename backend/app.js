import express from "express";
import cors from "cors";
import morgan from "morgan";
import roleplayRoutes from "./routes/roleplayRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
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
export default app;