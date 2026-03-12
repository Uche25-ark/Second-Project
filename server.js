import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// ROUTES IMPORT
import loginRoutes from "./routes/loginRoutes.js";
import consumerRoutes from "./routes/consumerRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/login", loginRoutes)
app.use("/consumers", consumerRoutes)
app.use("/sellers", sellerRoutes)
app.use("/products", productRoutes)
app.use("/cart", cartRoutes)
app.use("/orders", orderRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});