import express from "express";
import cors from "cors";
import morgan from "morgan";
import roleplayRoutes from "./routes/roleplayRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1", roleplayRoutes);
app.use("/api/v1/session", sessionRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});
export default app;