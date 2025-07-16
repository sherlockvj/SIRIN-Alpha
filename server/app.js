const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const musicRoutes = require("./routes/music.routes");

const app = express();

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log("✅ Created /temp directory");
}

app.use(cors());
app.use(express.json());

// Serve temp folder statically
app.use("/static", express.static(tempDir));

// Health check
app.get("/api/status", (_, res) => {
  res.status(200).json({ status: "success", message: "API is healthy" });
});

// Music routes
app.use("/api/music", musicRoutes);

module.exports = app;
