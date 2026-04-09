import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Routes from "./routes/Routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Register all routes via the Routes class
new Routes(app); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));