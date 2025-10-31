import React from "react";
import { NotesProvider } from "./context/NotesContext";
import TopBar from "./components/TopBar";
import Notes from "./pages/Notes";

export default function App() {
  return (
    <NotesProvider>
      <div className="min-h-screen">
        <TopBar />
        <main style={{ padding: 16 }}>
          <Notes />
        </main>
      </div>
    </NotesProvider>
  );
}
