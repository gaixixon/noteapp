/*
import React, { createContext, useContext, useEffect, useState } from "react";
import { get, set } from "idb-keyval";

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    get("notes").then((saved) => {
      if (saved && Array.isArray(saved)) setNotes(saved);
    }).catch((e) => {
      console.error("Failed to load notes from IndexedDB:", e);
    });
  }, []);

  useEffect(() => {
    // save to IndexedDB on every change
    set("notes", notes).catch((e) => {
      console.error("Failed to save notes to IndexedDB:", e);
    });
  }, [notes]);

  const addNote = (title = "Untitled", content = "") => {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      tags: [],
      images: [],
      files: [],
      updated_at: new Date().toISOString(),
      deleted: false,
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id, patch) => {
    setNotes((prev) => prev.map(n => n.id === id ? { ...n, ...patch, updated_at: new Date().toISOString() } : n));
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, deleted: true, updated_at: new Date().toISOString() } : n)));
  };

  const restoreNote = (id) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, deleted: false, updated_at: new Date().toISOString() } : n)));
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes, addNote, updateNote, deleteNote, restoreNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext);
*/