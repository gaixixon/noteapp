import { useState, useEffect, useMemo } from "react";
import { getAllNotes, saveNote } from "../db";
import { Link, useNavigate } from "react-router-dom";
import "../index.css"; // make sure to include CSS below
import SplashMessage from "../components/SplashMessage";
import { startPolling } from "../utils/sync";
import { useFlash } from "../context/FlashContext.jsx";


export default function Notes() {
  const { showFlash } = useFlash();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showBar, setShowBar] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showTags, setShowTags] = useState(true); // Collapsible tag bar
  const navigate = useNavigate();

  const [splash, setSplash] = useState("");
 

  // Load all notes
  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    const sorted = allNotes
      .filter((n) => !n.deleted)
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    setNotes(sorted);
  };

  useEffect(() => {
    startPolling();
  }, []);

  useEffect(() => {
    loadNotes();
  }, []);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query && !selectedTag) return notes;

    const orGroups = query.split(",").map((g) => g.trim()).filter(Boolean);

    return notes.filter((n) => {
      const noteText = `${n.title} ${n.content} ${n.tags?.join(" ")}`.toLowerCase();
      const matchesOr = orGroups.length
        ? orGroups.some((group) => {
            const andParts = group.split("+").map((p) => p.trim()).filter(Boolean);
            return andParts.every((term) => noteText.includes(term));
          })
        : true;
      const matchesTag = selectedTag ? n.tags?.includes(selectedTag) : true;
      return matchesOr && matchesTag;
    });
  }, [notes, search, selectedTag]);

  // Scroll: hide/show sticky bar + load more
  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowBar(currentScroll <= lastScroll || currentScroll < 50);
      lastScroll = currentScroll;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setVisibleCount((c) => Math.min(c + 20, filteredNotes.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredNotes.length]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  const handleAdd = async () => {
    const newNote = {
      id: generateId(),
      title: "",
      content: "",
      location: "",
      tags: [],
      images: [],
      updated_at: new Date().toISOString(),
      deleted: false,
    };
    await saveNote(newNote);
    setNotes([newNote, ...notes]);
    navigate(`/note/${newNote.id}?edit=true&isNew=true`);
  };

  const handleDelete = async (e, note) => { setSplash('Deeleting');  showFlash("Note saved successfully!", "success", 2000);
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    await saveNote({ ...note, deleted: true });
    loadNotes();
  };

  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [notes]);

  const visibleNotes = filteredNotes.slice(0, visibleCount);

  return (

    <div className="notes-page">
      {/* Search + tag filter */}
      <div className={`notes-search ${showBar ? "visible" : "hidden"}`}>
        <input
          type="text"
          placeholder="Search: use ',' for OR, '+' for AND"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {allTags.length > 0 && (
          <>
            <div
              className="notes-tags-header"
              onClick={() => setShowTags((s) => !s)}
              style={{ cursor: "pointer", userSelect: "none", marginTop: "0.25rem" }}
            >
              <span>Tags</span>
              <span style={{ marginLeft: "0.25rem" }}>{showTags ? "▼" : "▶"}</span>
            </div>

            <div className={`notes-tags ${showTags ? "" : "collapsed"}`}>
              <button onClick={() => setSelectedTag("")} className={!selectedTag ? "active" : ""}>All</button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
                  className={selectedTag === tag ? "active" : ""}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notes list */}
      <div className="notes-list">
        {visibleNotes.length === 0 && <p>No notes found.</p>}
        {visibleNotes.map((note) => (
          <div key={note.id} className="note-card-wrapper">
            <Link to={`/note/${note.id}`} className="note-card">
              <h3 className="note-title">{note.title || "Untitled"}</h3>
              <p className="note-content">{note.content.slice(0, 100)}</p>
              {note.images?.length > 0 && (
                <div className="note-thumb-wrapper">
                  <img src={note.images[0].base64} alt={note.images[0].name} className="note-thumb" />
                </div>
              )}

            </Link>

            {note.tags?.length > 0 && (
              <div className="note-tags">
                {note.tags.map((tag, i) => (
                  <span
                    key={i}
                    onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
                    className={`note-tag ${selectedTag === tag ? "active" : ""}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {note.updated_at && (
              <p className="note-updated">Last edited: {new Date(note.updated_at).toLocaleString()}</p>
            )}
            
            <button onClick={(e) => handleDelete(e, note)} className="note-delete">🗑️</button>
          </div>
        ))}
      <button className={`add-btn ${showBar ? "visible" : "hidden"}`} onClick={handleAdd}>+</button>
      </div>

      {splash && (
        <SplashMessage
          message={splash}
          duration={2000}
          onClose={() => setSplash("")}
        />
      )}
 
    </div>
  );
}
