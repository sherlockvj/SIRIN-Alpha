import React, { useEffect, useRef, useState } from "react";
import "./PlaygroundPage.css";
import api from "../../api/api";

const loadingMessages = [
    "Translating strokes into soundwaves...",
    "Harmonizing your sketch...",
    "Composing a sonic masterpiece...",
    "Warming up the instruments...",
    "Calibrating colors into chords...",
    "Generating melody from motion...",
];

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

    const [musicURL, setMusicURL] = useState("");

    const toolRef = useRef(tool);
    const colorRef = useRef(color);

    useEffect(() => {
        toolRef.current = tool;
    }, [tool]);

    useEffect(() => {
        colorRef.current = color;
    }, [color]);

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
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
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

            if (toolRef.current === "brush") {
                ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = colorRef.current;
            } else {
                ctx.globalCompositeOperation = "destination-out";
                ctx.strokeStyle = "rgba(0,0,0,1)";
            }

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
    }, [isGenerating]);

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
        const ctx = ctxRef.current;
        redoStack.current.push(undoStack.current.pop());
        const prev = undoStack.current[undoStack.current.length - 1];
        ctx.putImageData(prev, 0, 0);
    };

    const handleRedo = () => {
        if (redoStack.current.length === 0 || isGenerating) return;
        const ctx = ctxRef.current;
        const restored = redoStack.current.pop();
        undoStack.current.push(restored);
        ctx.putImageData(restored, 0, 0);
    };

    // const handleGenerate = () => {
    //     setIsGenerating(true);
    //     setTimeout(() => {
    //         setIsGenerating(false);
    //         // TODO: Trigger actual music generation API
    //     }, 8000);
    // };

    const handleGenerate = async () => {
        setIsGenerating(true);

        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL("image/png");

        const res = await api.post("/generate-music", { image: dataURL });
        const data = await res.json();
        setIsGenerating(false);
        setMusicURL(data.audioUrl);
    };

    return (
        <div className="playground-wrapper">
            <header className="playground-header">
                <h1 className="playground-title">Playground</h1>
                <p className="playground-subtext">
                    Express your creativity — draw freely and generate unique musical patterns from your strokes.
                </p>
            </header>

            <div className="playground-container">
                <div className="canvas-section">
                    <h2 className="section-title">Canvas</h2>

                    <canvas
                        ref={canvasRef}
                        id="drawing-canvas"
                        style={{
                            width: "100%",
                            height: "300px",
                            borderRadius: "10px",
                            backgroundColor: "#0d0d1f",
                            boxShadow: "0 0 10px rgba(0,255,231,0.2)",
                            cursor: tool === "eraser" ? "cell" : "crosshair",
                            pointerEvents: isGenerating ? "none" : "auto",
                            opacity: isGenerating ? 0.4 : 1,
                        }}
                    ></canvas>

                    <div className="canvas-tools">
                        <button className={`tool-btn ${tool === "brush" ? "active-tool" : ""}`} onClick={() => setTool("brush")} disabled={isGenerating}>🖌️ Brush</button>
                        <button className={`tool-btn ${tool === "eraser" ? "active-tool" : ""}`} onClick={() => setTool("eraser")} disabled={isGenerating}>🧽 Eraser</button>
                        <input type="color" className="color-picker" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === "eraser" || isGenerating} />
                        <button className="tool-btn" onClick={handleUndo} disabled={isGenerating}>↩️ Undo</button>
                        <button className="tool-btn" onClick={handleRedo} disabled={isGenerating}>↪️ Redo</button>
                        <button
                            className="generate-btn"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? "⏳ Generating..." : "🎶 Generate Music"}
                        </button>
                    </div>
                </div>

                <div className="music-section">
                    <h2 className="section-title">Generated Music</h2>
                    <div className="music-box">
                        {isGenerating ? (
                            <p className="loading-message">{loadingMessages[loadingIndex]}</p>
                        ) : (
                            <p>🎵 Your sketch will be interpreted into sound here.</p>
                        )}
                    </div>
                    <div className="music-controls">
                        <button className="action-btn">▶️ Play</button>
                        <button className="action-btn">⏹️ Stop</button>
                        <button className="action-btn">🔄 Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPage;
