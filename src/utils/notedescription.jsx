// NoteDescriptionPlain.jsx
import React from "react";
import "../style/notedescription.css";

export default function NoteDescriptionPlain({ text }) {
  const lines = text.split(/\r?\n/);
  return (
    <div className="note-description">
      {lines.map((raw, i) => {
        const line = raw.replace(/\t/g, " ").replace(/\s+$/, "");
        if (!line) return <div key={i} />;

        if (line.startsWith("*")) {
          return (
            <div key={i} className="nd-row nd-bullet">
              <span className="nd-icon">•</span>
              <span className="nd-content">{line.slice(1)}</span>
            </div>
          );
        }
        if (line.startsWith("+")) {
          return (
            <div key={i} className="nd-row nd-done-bullet">
              <span className="nd-icon">✓</span>
              <span className="nd-content">{line.slice(1)}</span>
            </div>
          );
        }
        if (line.startsWith("-")) {
          return (
            <div key={i} className="nd-row nd-done-job">
              <span className="nd-icon">—</span>
              <span className="nd-content nd-done">{line.slice(1)}</span>
            </div>
          );
        }
        return <div key={i} className="nd-row">{line}</div>;
      })}
    </div>
  );
}
