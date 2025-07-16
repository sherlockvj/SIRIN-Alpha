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

    // 🔍 Check if canvas is empty
    let isEmpty = true;
    image.scan(0, 0, width, height, function (x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const brightness = (r + g + b) / 3;
        if (brightness > 10) {
            isEmpty = false;
        }
    });

    if (isEmpty) {
        fs.unlinkSync(filePath); // clean up image
        return null;
    }

    const midi = new Midi();
    const track = midi.addTrack();

    // 🎵 Generate notes from sketch only
    const timeBins = 30;
    const pitchBands = 16;
    const binWidth = Math.floor(width / timeBins);
    const bandHeight = Math.floor(height / pitchBands);
    const totalTime = 8;
    const scale = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];

    for (let t = 0; t < timeBins; t++) {
        const xStart = t * binWidth;
        const xEnd = Math.min((t + 1) * binWidth, width);
        const time = (t / timeBins) * totalTime;

        for (let b = 0; b < pitchBands; b++) {
            const yStart = b * bandHeight;
            const yEnd = Math.min((b + 1) * bandHeight, height);

            let brightnessTotal = 0;
            let pixelCount = 0;

            for (let x = xStart; x < xEnd; x++) {
                for (let y = yStart; y < yEnd; y++) {
                    const idx = (y * width + x) * 4;
                    const r = image.bitmap.data[idx];
                    const g = image.bitmap.data[idx + 1];
                    const bVal = image.bitmap.data[idx + 2];
                    const brightness = (r + g + bVal) / 3;
                    brightnessTotal += brightness;
                    pixelCount++;
                }
            }

            const avgBrightness = brightnessTotal / pixelCount;
            if (avgBrightness > 40) {
                const scaleIndex = b % scale.length;
                const midiNote = scale[scaleIndex];
                const velocity = Math.min(1.0, Math.max(0.5, avgBrightness / 255));

                track.addNote({
                    midi: midiNote,
                    time,
                    duration: 0.3,
                    velocity,
                });
            }
        }
    }

    const midiBuffer = midi.toArray();
    const midiFilePath = filePath.replace(".png", ".mid");
    fs.writeFileSync(midiFilePath, Buffer.from(midiBuffer));

    fs.unlinkSync(filePath); // cleanup image
    return midiFilePath;
};

module.exports = { generateMusicFromImage };
