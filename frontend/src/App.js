import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ParliamentariumBoard from "./components/ParliamentariumBoard";
import MeetingRoom from "./components/MeetingRoom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ParliamentariumBoard />} />
          <Route path="/meeting" element={<MeetingRoom />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;