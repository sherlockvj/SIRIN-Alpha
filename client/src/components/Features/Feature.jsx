import React from "react";
import "./Feature.css";

const features = [
  {
    title: "✍️ Draw",
    description: "Sketch freely using the intuitive canvas with multiple tools and colors.",
  },
  {
    title: "🎨 Color = Sound",
    description: "Each color and shape influences the tone, pitch, and instrument.",
  },
  {
    title: "🎼 Generate Music",
    description: "Watch your drawing turn into sound in real-time using smart audio synthesis.",
  },
  {
    title: "📤 Export & Share",
    description: "Save your creations or share them with others directly from the app.",
  },
];

const Feature = () => {
  return (
    <div className="how-section" id="how-it-works">
      <h2 className="how-title">How It Works</h2>
      <div className="feature-grid">
        {features.map((feat, index) => (
          <div className="feature-card" key={index}>
            <h3>{feat.title}</h3>
            <p>{feat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feature;
