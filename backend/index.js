import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/mongoConnection.js";
dotenv.config();

const PORT = process.env.PORT || 3000;
console.log(process.env.CLAUDE_API_KEY)
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});