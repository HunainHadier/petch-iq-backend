import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

// ✅ Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ File path setup for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Make "uploads" folder publicly accessible
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Database connection test
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ MySQL Connected");
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err);
    process.exit(1);
  }
})();

// ✅ Routes
import userRoutes from "./router/user-routes.js";
import customerRoutes from "./router/customerRoutes.js";
import locationRoutes from "./router/locationRoutes.js";
import meetingRoutes from "./router/meetingRoutes.js";
import photoRoutes from "./router/photoRoutes.js";
import aiResultRoutes from "./router/aiResultRoutes.js";
import subscriptionRoutes from "./router/subscriptionRoutes.js";
import invoiceRoutes from "./router/invoiceRoutes.js";


app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));

// Routes

app.use("/api/customers", customerRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/ai-results", aiResultRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("📬 Email Clone Backend Running Successfully!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
