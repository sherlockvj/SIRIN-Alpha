const fs = require("fs");
const { generateMusicFromImage } = require("../utils/musicProcessor");

const generateMusic = async (req, res) => {
    try {
        const { image } = req.body;
        const midiPath = await generateMusicFromImage(image);

        if (!midiPath) {
            return res.status(401).json({ success: false, midiBase64: "" });
        }

        const midiData = fs.readFileSync(midiPath);
        fs.unlinkSync(midiPath);

        const base64Midi = midiData.toString("base64");
        res.json({ success: true, midiBase64: base64Midi });
    } catch (err) {
        console.error("Error generating music:", err);
        res.status(500).json({ success: false, message: "Failed to generate music" });
    }
};

module.exports = { generateMusic };
