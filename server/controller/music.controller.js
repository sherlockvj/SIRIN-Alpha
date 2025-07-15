const fs = require("fs");
const { generateMusicFromImage } = require("../utils/musicProcessor");

const generateMusic = async (req, res) => {
  try {
    const { image } = req.body; // base64
    const midiPath = await generateMusicFromImage(image);
    const midiData = fs.readFileSync(midiPath);
    const base64Midi = midiData.toString("base64");

    res.json({
      success: true,
      midiBase64: base64Midi,
    });
  } catch (err) {
    console.error("Error generating music:", err);
    res.status(500).json({ success: false, message: "Failed to generate music" });
  }
};

module.exports = { generateMusic };
