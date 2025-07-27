# Sirin — Sketch to Sound Generator

**Sirin** is a creative web-based tool that turns your sketches into music. Just draw freely on the canvas, and our AI translates those visual strokes into unique melodies and rhythms — right in your browser.

> Try it live: [https://sirin-alpha.vercel.app](https://sirin-alpha.vercel.app)

---

## Project Goal

The main goal behind Sirin is to make music creation feel playful, intuitive, and accessible — especially for people who may not have any background in music. Whether you're a developer, an artist, a musician, or just someone curious about generative art, Sirin gives you a fun new way to explore the intersection of drawing and sound.

---

## Key Features

- **Sketch-Based Music Creation** – Draw on a canvas using a brush, eraser, and undo/redo functionality. Choose from a palette of vibrant neon colors.
- **Real-Time AI Music Generator** – Your sketch is turned into a live musical composition using MIDI logic.
- **In-Browser Audio Playback** – Music is played instantly using [Tone.js](https://tonejs.github.io/) without any downloads or plugins.
- **Visual Playback** – Watch your music come alive as animated tiles dance across the screen during playback.
- **Instant Feedback** – The app gives you visual cues and status updates like when your music is successfully generated.
- **No Uploads Required** – Sketches are processed via base64 image transfer; nothing is stored or uploaded.

---

## How It Works

1. You draw freely on the canvas using brush tools and vibrant colors.
2. When you hit "Generate Music", the drawing is converted into a base64 image.
3. This image is sent to a Node.js backend, where:
   - I analyze the brightness and position of strokes using **Jimp**.
   - That visual data is mapped to musical parameters like pitch, volume, and timing.
   - A MIDI file is created using **@tonejs/midi** and sent back.
4. The frontend then uses **Tone.js** to:
   - Decode the MIDI data.
   - Play it as music while showing animated note tiles in sync.

---

## Tech Stack

| Frontend        | Backend             | Other Tools        |
|-----------------|---------------------|--------------------|
| React + CSS     | Node.js + Express   | Jimp, @tonejs/midi |
| Tone.js         | RESTful APIs        | Hosted on Render   |

---

## Future Enhancements

We're excited to keep improving Sirin. Here's what's coming next:

1. **Downloadable Tunes** – Let users export their generated music as MIDI or audio files.
2. **Mobile Support** – Enable touch gesture drawing for a fully mobile-friendly experience.
3. **Better Guidance** – Provide tips, examples, and prompts to help users create more interesting musical outputs.
4. **User Accounts** – Allow users to sign up and log in.
5. **Tone History & Saving** – Give users the ability to save and revisit their previous creations.

---