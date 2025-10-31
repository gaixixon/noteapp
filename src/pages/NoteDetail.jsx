import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getNote, saveNote } from "../db";
import { useFlash } from "../context/FlashContext.jsx";
import getLocation from "../utils/location.js";
import NoteDescriptionPlain from "../utils/notedescription.jsx";

export default function NoteDetail() {
  const {showFlash } = useFlash();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editMode = query.get("edit") === "true";
  const isNew = query.get("isNew") === "true";

  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(""); // for tags
  const [zoomImage, setZoomImage] = useState(null);

  // Load note
  useEffect(() => {
    getNote(id).then((data) => {
      if (data) setNote(data);
    });
  }, [id]);

  // Set editMode if query has ?edit=true
  useEffect(() => {
    if (editMode) setIsEditing(true);
  }, [editMode]);

  const updateField = (key, value) => {
    setNote((prev) => ({ ...prev, [key]: value }));
  };

  // Tag input
  const handleTagInput = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !note.tags?.includes(value)) {
        updateField("tags", [...(note.tags || []), value]);
      }
      setInputValue("");
    }
  };

  const handleRemoveTag = (tag) => {
    updateField("tags", note.tags.filter((t) => t !== tag));
  };

  // Image upload
  const handleImageChange = (e) => { showFlash("Note saved successfully!", "success", 2000);
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 1600; // max longer side in px
          let { width, height } = img;

          // Calculate scale factor
          const maxDim = Math.max(width, height);
          const scale = maxDim > maxSize ? maxSize / maxDim : 1;

          // Apply scale to get new size
          width = Math.round(width * scale);
          height = Math.round(height * scale);

          // Draw on canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to Base64 (JPEG quality 0.7)
          const base64 = canvas.toDataURL("image/jpeg", 0.7);

          // Update your state
          updateField("images", [...(note.images || []), { name: file.name, base64 }]);
        };

        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };


  const removeImage = (index) => {
    updateField(
      "images",
      note.images.filter((_, i) => i !== index)
    );
  };

  const handleSave = async () => {
    if (!note.title?.trim()) {
      alert("Note title cannot be blank!");
      showFlash("Note saved successfully!", "success", 2000);
      return;
    }
    await saveNote({ ...note, updated_at: new Date().toISOString() });
    setIsEditing(false);
    navigate(-1);
  };

  const handleCancel = async () => {
    if (!isNew) {
      setIsEditing(false);
    } else {
      // Soft delete new note
      await saveNote({ ...note, deleted: true });
      navigate(-1);
    }
  };
  // handle files
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    for (const file of files) {
      if (!["application/pdf", "application/zip"].includes(file.type.toLowerCase())) {
        alert(`${file.name} must be .pdf or .zip`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds 10MB`);
        continue;
      }
      newFiles.push(file);
    }

    setNote((prev) => ({ ...prev, files: [...(prev.files || []), ...newFiles] }));
    e.target.value = "";
  };

  const removeFile = (index) => {
    setNote((prev) => {
      const files = [...(prev.files || [])];
      files.splice(index, 1);
      return { ...prev, files };
    });
  };

  // handle files

  if (!note) return <div className="flex items-center justify-center h-screen text-gray-500">Note not found.</div>;

  return (
    <div className="note-detail">
      <div className="note-detail-card">

        {isEditing ? (
          <>
            <input
              className="note-input"
              value={note.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              autoFocus placeholder="Note title"
            />
            <textarea
              className="note-textarea"
              value={note.content || ""}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Write your note here..."
            />

            {/* Tag input */}
            <div className="tag-section">
              <input
                className="note-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Type tag and press Enter"
              />
              {note.tags?.length > 0 && (
                <div className="tag-list">
                  {note.tags.map((tag, i) => (
                    <div key={i} className="tag-chip">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Tag input */}
            {/* Location input */}
            <div className="location-group">
              <button className="location-btn" onClick={async () => {
                try {
                  const loc = await getLocation();
                  updateField("location", loc);
                } catch (err) {
                  alert("Failed to get location: " + err.message);
                }
              }}>
                📍 Get Location
              </button>

              <input
                className="location-input"
                value={
                  note.location
                    ? `${note.location}`
                    : null
                }
                readOnly
                placeholder="Latitude, Longitude"
              />
            </div>
            {/* Location input */}
            {/* Image upload */}

            <div className="image-upload" style={{ marginTop: "16px" }}>
              {/* Add Image Button */}
              <label htmlFor="imageInput" className="add-image-btn">
                + Add Image
              </label>
              <input
                type="file"
                id="imageInput"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              {/* Thumbnails */}
              {note.images?.length > 0 && (
                <div className="image-thumbnails">
                  {note.images.map((img, i) => (
                    <div key={i} className="thumb">
                      <img src={img.base64} alt={img.name} />
                      <button type="button" onClick={() => removeImage(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Images upload */}
            
            {/* File Upload */}
            <div className="file-upload" style={{ marginTop: "16px" }}>
              <label htmlFor="fileInput" className="add-file-btn">
                + Add File
              </label>
              <input
                type="file"
                id="fileInput"
                multiple
                accept=".zip,.pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {note.files?.length > 0 && (
                <div className="file-list">
                  {note.files.map((file, i) => (
                    <div key={i} className="file-item">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* file upload */}
            <div className="note-detail-actions">
              <button onClick={handleCancel} className="back-btn">Cancel</button>
              <button onClick={handleSave} className="edit-btn">Save</button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", borderBottom: "2px solid #ccc", paddingBottom: "8px", marginBottom: "16px" }}>
              {note.title}
            </h2>
            <NoteDescriptionPlain text={note.content} />
            
            <div className="image-gallery">
              {note.images?.map((img, i) => (
                <img key={i} src={img.base64} alt={img.name} className="note-thumb" onClick={() => setZoomImage(img.base64)} />
              ))}
            </div>

            {zoomImage && (
              <div className="lightbox" onClick={() => setZoomImage(null)}>
                <img src={zoomImage} alt="Full view" className="lightbox-img" />
              </div>
            )}

            {note.tags?.length > 0 && (
              <div className="tag-list">
                {note.tags.map((tag, i) => (
                  <span key={i} className="tag-chip">#{tag}</span>
                ))}
              </div>
            )}
            {/* Open google maps if location exists */}
            {note.location && (
              <div className="location-view mt-2">
                <a
                  href={`https://www.google.com/maps?q=${note.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition"
                >
                  🌎 Open in Google Maps
                </a>
              </div>
            )}

            {/* Open google maps if location exists */}
            

            <p className="note-updated">Last edited: {new Date(note.updated_at).toLocaleString()}</p>

            <div className="note-detail-actions">
              <button onClick={() => navigate(-1)} className="back-btn">Back</button>
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
