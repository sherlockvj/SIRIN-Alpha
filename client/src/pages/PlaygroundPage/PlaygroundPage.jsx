import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import api from "../../api/api";
import "./PlaygroundPage.css";

const loadingMessages = [
    "Translating strokes into soundwaves...",
    "Harmonizing your sketch...",
    "Composing a sonic masterpiece...",
    "Warming up the instruments...",
    "Calibrating colors into chords...",
    "Generating melody from motion...",
];

const Toast = ({ isSuccess, message, onClose }) => (
    <div className={isSuccess ? "toast success" : "toast error"}>
        <span>{message}</span>
        <button onClick={onClose}>✖</button>
    </div>
);

const PlaygroundPage = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawingRef = useRef(false);
    const undoStack = useRef([]);
    const redoStack = useRef([]);

    const [tool, setTool] = useState("brush");
    const [color, setColor] = useState("#00ffe7");
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [toast, setToast] = useState(null);
    const [errorToast, setErrorToast] = useState(null);
    const [noteTiles, setNoteTiles] = useState([]);
    const [playingNoteIndex, setPlayingNoteIndex] = useState(-1);
    const [midiBuffer, setMidiBuffer] = useState(null);

    const toolRef = useRef(tool);
    const colorRef = useRef(color);

    useEffect(() => { toolRef.current = tool }, [tool]);
    useEffect(() => { colorRef.current = color }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        ctx.fillStyle = "#0d0d1f";
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctxRef.current = ctx;

        saveState();

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        const handleMouseDown = (e) => {
            if (isGenerating) return;
            const { x, y } = getPos(e);
            isDrawingRef.current = true;
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const handleMouseMove = (e) => {
            if (!isDrawingRef.current || isGenerating) return;
            const { x, y } = getPos(e);
            ctx.globalCompositeOperation = toolRef.current === "brush" ? "source-over" : "destination-out";
            ctx.strokeStyle = toolRef.current === "brush" ? colorRef.current : "rgba(0,0,0,1)";
            ctx.lineTo(x, y);
            ctx.stroke();
        };

        const handleMouseUp = () => {
            if (!isDrawingRef.current) return;
            isDrawingRef.current = false;
            ctx.closePath();
            saveState();
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (!isGenerating) return;
        const interval = setInterval(() => {
            setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isGenerating]);

    const saveState = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStack.current.length > 30) undoStack.current.shift();
        redoStack.current = [];
    };

    const handleUndo = () => {
        if (undoStack.current.length <= 1 || isGenerating) return;
        redoStack.current.push(undoStack.current.pop());
        ctxRef.current.putImageData(undoStack.current[undoStack.current.length - 1], 0, 0);
    };

    const handleRedo = () => {
        if (redoStack.current.length === 0 || isGenerating) return;
        const restored = redoStack.current.pop();
        undoStack.current.push(restored);
        ctxRef.current.putImageData(restored, 0, 0);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setToast(null);
        setErrorToast(null);
        setNoteTiles([]);
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL("image/png");

        try {
            const res = await api.post("/music/generate-music", { image: dataURL });
            const { midiBase64 } = res.data;
            const binary = atob(midiBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

            const midi = new Midi(bytes);
            setMidiBuffer(midi);

            // Extract note tiles
            const tiles = [];
            midi.tracks.forEach((track) => {
                track.notes.forEach((note, index) => {
                    tiles.push({ name: note.name, velocity: note.velocity, index });
                });
            });
            setNoteTiles(tiles);
            setToast("🎶 Music generated! Ready to play");

        } catch (err) {
            console.error("Error:", err);
            setErrorToast("❌ Failed to generate music");
        }

        setIsGenerating(false);
    };

    const handlePlay = async () => {
        if (!midiBuffer) return;
        await Tone.start();
        const now = Tone.now();
        const synth = new Tone.PolySynth().toDestination();

        setPlayingNoteIndex(0);

        const allNotes = midiBuffer.tracks.flatMap(track => track.notes);

        allNotes.forEach((note, i) => {
            synth.triggerAttackRelease(note.name, note.duration, now + note.time, note.velocity);
            setTimeout(() => setPlayingNoteIndex(i), note.time * 1000);
        });

        setTimeout(() => setPlayingNoteIndex(-1), (Math.max(...allNotes.map(n => n.time)) + 2) * 1000);
    };

    const handleStop = () => {
        Tone.Transport.stop();
        setPlayingNoteIndex(-1);
    };

    return (
        <div className="playground-wrapper">
            <header className="playground-header">
                <h1 className="playground-title">Playground</h1>
                <p className="playground-subtext">
                    Express your creativity — draw freely and generate unique musical patterns from your strokes.
                </p>
            </header>

            {toast && <Toast isSuccess={true} message={toast} onClose={() => setToast(null)} />}
            {errorToast && <Toast isSuccess={false} message={errorToast} onClose={() => setErrorToast(null)} />}

            <div className="playground-container">
                <div className="canvas-section">
                    <h2 className="section-title">Canvas</h2>
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100%",
                            height: "300px",
                            borderRadius: "10px",
                            backgroundColor: "#0d0d1f",
                            boxShadow: "0 0 10px rgba(0,255,231,0.2)",
                            cursor: tool === "eraser" ? "cell" : "crosshair",
                            pointerEvents: isGenerating ? "none" : "auto",
                            opacity: 1,
                        }}
                    />

                    <div className="canvas-tools">
                        <button className={`tool-btn ${tool === "brush" ? "active-tool" : ""}`} style={{ pointerEvents: isGenerating ? "none" : "auto" }} onClick={() => setTool("brush")} disabled={isGenerating}>🖌️ Brush</button>
                        <button className={`tool-btn ${tool === "eraser" ? "active-tool" : ""}`} style={{ pointerEvents: isGenerating ? "none" : "auto" }} onClick={() => setTool("eraser")} disabled={isGenerating}>🧽 Eraser</button>
                        <input type="color" className="color-picker" value={color} style={{ pointerEvents: isGenerating ? "none" : "auto" }} onChange={(e) => setColor(e.target.value)} disabled={tool === "eraser" || isGenerating} />
                        <button className="tool-btn" onClick={handleUndo} style={{ pointerEvents: isGenerating ? "none" : "auto" }} disabled={isGenerating}>↩️ Undo</button>
                        <button className="tool-btn" onClick={handleRedo} style={{ pointerEvents: isGenerating ? "none" : "auto" }} disabled={isGenerating}>↪️ Redo</button>
                        <button className="generate-btn" style={{ pointerEvents: isGenerating ? "none" : "auto" }} onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? "⏳ Generating..." : "🎶 Generate Music"}
                        </button>
                    </div>
                </div>

                <div className="music-section">
                    <h2 className="section-title">Generated Notes</h2>
                    <div className="music-tiles-container">
                        {isGenerating ? (
                            <p className="loading-message">{loadingMessages[loadingIndex]}</p>
                        ) : noteTiles.length > 0 ? (
                            <div className="note-tile-grid">
                                {noteTiles.map((note, idx) => (
                                    <div key={idx} className={`note-tile ${idx === playingNoteIndex ? "playing" : ""}`}>
                                        {note.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>🎵 Your sketch will be interpreted into sound here.</p>
                        )}
                    </div>

                    <div className="music-controls">
                        <button className="action-btn" onClick={handlePlay} disabled={!midiBuffer}>▶️ Play</button>
                        <button className="action-btn" onClick={handleStop} disabled={!midiBuffer}>⏹️ Stop</button>
                        <button className="action-btn" onClick={() => window.location.reload()}>🔄 Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPage;
