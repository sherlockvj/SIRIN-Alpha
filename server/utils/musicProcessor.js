const fs = require("fs");
const path = require("path");
const jimp = require("jimp");
const { Midi } = require("@tonejs/midi");

const generateMusicFromImage = async (base64Image) => {
  const buffer = Buffer.from(base64Image.split(",")[1], "base64");
  const filePath = path.join(__dirname, "../temp", `drawing-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  const image = await jimp.read(filePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  const midi = new Midi();
  const track = midi.addTrack();

  image.scan(0, 0, width, height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const brightness = (r + g + b) / 3;

    if (brightness > 30) {
      const note = 60 + Math.floor((y / height) * 24); // pitch
      const time = (x / width) * 10; // time in seconds
      const duration = 0.2;

      track.addNote({
        midi: note,
        time,
        duration,
        velocity: brightness / 255,
      });
    }
  });

  const midiBuffer = midi.toArray();
  const midiFilePath = filePath.replace(".png", ".mid");
  fs.writeFileSync(midiFilePath, Buffer.from(midiBuffer));

  return midiFilePath;
};

module.exports = { generateMusicFromImage };
