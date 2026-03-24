import consumerRoutes from "./consumerRoutes.js";
import sellerRoutes from "./sellerRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
// import loginRoutes from "./loginRoutes.js";

class Routes {
  constructor(app) {
    this.app = app;
    this.registerRoutes();
  }

  registerRoutes() {
    // this.app.use("/api/login", loginRoutes);
    this.app.use("/api/consumers", consumerRoutes);
    this.app.use("/api/sellers", sellerRoutes);
    this.app.use("/api/products", productRoutes);
    this.app.use("/api/cart", cartRoutes);
    this.app.use("/api/orders", orderRoutes);

    // Health check
    this.app.get("/api/health", (req, res) => {
      res.json({ message: "API is running ✅" });
    });
  }
}

export default Routes;