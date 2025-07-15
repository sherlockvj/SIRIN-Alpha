import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Feature from "../../components/Features/Feature";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleTryNow = () => {
    navigate("/playground");
  };

  return (
    <div className="landing-wrapper">
      {/* Glowing Background Blobs */}
      <div className="glow cyan-glow"></div>
      <div className="glow pink-glow"></div>

      {/* Main Landing Section */}
      <div className="landing-container">
        <div className="landing-content">
          <h1 className="hero-title">
            Turn Your <span className="gradient-text">Sketches</span> Into{" "}
            <span className="gradient-text">Symphonies</span>
          </h1>
          <p className="hero-subtext">
            Draw on canvas and watch your imagination transform into real-time
            audio. A fusion of art, emotion, and music — only at Synesthetic Studio.
          </p>

          <div className="landing-buttons">
            <button className="try-now-btn" onClick={handleTryNow}>
              🎨 Try Now
            </button>
            <a href="#how-it-works" className="how-it-works-link">
              ℹ️ How it works
            </a>
          </div>
        </div>
      </div>

      {/* Feature section below landing */}
      <Feature />
    </div>
  );
};

export default LandingPage;
