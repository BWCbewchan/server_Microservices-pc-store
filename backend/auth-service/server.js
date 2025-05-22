require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const { ensureAdminExists } = require("./controllers/adminAuthController");

const app = express();
const PORT = process.env.PORT || 4006;

// Configure email credentials from environment variables
process.env.EMAIL_USER = process.env.EMAIL_USER || "bewchan06@gmail.com";
process.env.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "sidc idil qwxj zirp";

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Auth service is running!");
});

// Swagger UI for API documentation
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCss: '.swagger-ui .topbar { display: none }' }));

// API routes
app.use("/", routes);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pc-store-auth";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Ensure admin user exists
    ensureAdminExists();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
