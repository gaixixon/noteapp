// src/utils/sync.js

import { getAllNotes, saveNote, deleteNote } from "../db";
import SplashMessage from "../components/SplashMessage";

// Save last sync time
export const saveLastSync = (date) => {
  localStorage.setItem("lastSync", date.toISOString());
};

// Get last sync time
export const getLastSync = () => {
  const date = localStorage.getItem("lastSync");
  return date ? new Date(date) : null;
};

// Merge server notes into local DB
export const mergeNotes = async (serverNotes = []) => {
  for (const note of serverNotes) {
    if (note.deleted) {
      // Soft delete handling
      await deleteNote(note.id);
    } else {
      await saveNote(note);
    }
  }
};

// Main sync function
export const syncWithServer = async () => {
  const [splash, setSplash] = useState("");
  setSplash('Syncing now......');
  
  try {
    const lastSync = getLastSync(); 
    const localNotes = await getAllNotes();

    // Send local notes + last sync time to server
    const response = await fetch("https://your-server.com/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastSync,
        notes: localNotes,
      }),
    });

    if (!response.ok) throw new Error("Sync failed");
    const { updatedNotes, serverTime } = await response.json();

    // Merge updated notes into local DB
    await mergeNotes(updatedNotes);

    // Save new sync time
    saveLastSync(new Date(serverTime));
  } catch (err) { 
    console.error("Sync error:", err);
  }
};

// Poll every 5 minutes
export const startPolling = () => { 
  //syncWithServer(); // initial run
  setInterval(syncWithServer, 1 * 60 * 1000);
};
