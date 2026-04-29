import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Routes from "./routes/Routes.js";

dotenv.config();

// 🔥 DB CONNECTION
connectDB();

const app = express();

// 🔥 INCREASE LIMIT FOR BASE64 IMAGES
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 🔥 BASIC SECURITY + STABILITY (RECOMMENDED)
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "Node.js");
  next();
});

// 🔥 REGISTER ROUTES
new Routes(app);

// 🔥 HEALTH CHECK ROUTE (USEFUL FOR TESTING)
app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "API is running 🚀",
  });
});

// 🔥 HANDLE UNKNOWN ROUTES
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

// 🔥 GLOBAL ERROR HANDLER (VERY IMPORTANT)
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(500).json({
    status: false,
    message: "Internal server error",
    error: err.message,
  });
});

// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);