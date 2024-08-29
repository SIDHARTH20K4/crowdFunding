import React from "react";
import "./styles.css";
import { Route, Routes } from "react-router-dom";
import Home from "./routes/Home";
import Explore from "./routes/Explore";
import Donate from "./routes/Donate";
import Contact from "./routes/Contact";

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/donations" element={<Donate />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}
