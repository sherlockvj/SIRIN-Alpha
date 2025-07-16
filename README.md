# 🎨🎶 Sirin — Sketch to Sound Generator

**Sirin** is a futuristic creative playground that transforms your freehand sketches into generative music. Simply draw on the canvas, and let the AI convert your strokes into melodic, harmonic, and rhythmic musical patterns — in real time!

> 🌐 Try it live https://sirin-alpha.vercel.app/

---

## 🚀 Aim

To build an intuitive and engaging experience that bridges **visual creativity with music generation**. Sirin aims to make **music composition more accessible and playful** for everyone — from artists and kids to developers and musicians.

---

## ✨ Features

- 🎨 **Freehand Sketch Canvas** — Draw with a brush, erase, undo/redo, and pick neon colors.
- 🎵 **AI Music Generator** — Converts canvas strokes into MIDI-based musical compositions.
- ⚙️ **Dynamic Audio Synthesis** — Plays your music instantly in-browser using [Tone.js](https://tonejs.github.io/).
- 🎚️ **Visual Playback** — Notes appear as animated tiles when music is playing.
- 🎉 **Custom Toasts** — Get real-time feedback like "Music Generated!" with beautiful UI prompts.
- 🧠 **No File Upload Needed** — All processing is done via base64 image exchange.

---

## 🧠 How It Works

1. **Draw a sketch** on the canvas using brushes and neon colors.
2. Hit **"Generate Music"**.
3. The canvas is converted to a **base64 PNG** and sent to a **Node.js backend**.
4. The backend:
   - Uses **Jimp** to analyze image brightness per grid.
   - Maps brightness + position to MIDI note, velocity, and timing.
   - Creates MIDI using **@tonejs/midi** and returns it as base64.
5. The frontend uses **Tone.js** to:
   - Convert MIDI into musical notes.
   - Render animated notes and play them live in the browser.

---

## 📦 Tech Stack

| Frontend | Backend | Other |
|----------|---------|-------|
| React + CSS | Node.js + Express | Jimp, @tonejs/midi |
| Tone.js | REST APIs | Render (deployment) |

---

