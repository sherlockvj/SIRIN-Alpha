const express = require("express");
const { generateMusic } = require("../controller/music.controller");

const router = express.Router();

router.post("/generate-music", generateMusic);

module.exports = router;
