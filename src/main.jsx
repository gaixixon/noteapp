import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Notes from "./pages/Notes.jsx";
import NoteDetail from "./pages/NoteDetail.jsx";
import "./index.css";
import {FlashProvider} from "./context/FlashContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <FlashProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/noteapp" element={<Notes />} />
        <Route path="/note/:id" element={<NoteDetail />} />
      </Routes>
    </BrowserRouter>
  </FlashProvider>
  </React.StrictMode>
);

