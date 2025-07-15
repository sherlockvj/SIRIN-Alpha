const express = require("express");
const cors = require("cors");
const path = require("path");

const musicRoutes = require("./routes/music.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve temp folder statically
app.use("/static", express.static(path.join(__dirname, "temp")));

// Health check
app.get("/api/status", (_, res) => {
  res.status(200).json({ status: "success", message: "API is healthy" });
});

// Music routes
app.use("/api/music", musicRoutes);

module.exports = app;
