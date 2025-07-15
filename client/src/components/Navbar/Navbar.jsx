import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <span>SIRIN Alpha</span>
      </div>

      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
          How It Works
        </a>
        <Link to="/playground" onClick={() => setMenuOpen(false)}>
          Playground
        </Link>
        <a href="#footer" onClick={() => setMenuOpen(false)}>
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
