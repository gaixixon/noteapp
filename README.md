# NoteApp (local)

This is a minimal Vite + React sample that stores notes in IndexedDB using `idb-keyval`.

How to run:

1. unzip or copy the folder
2. run `npm install`
3. run `npm run dev`
4. open http://localhost:5173

Notes:
- This project intentionally excludes any backend syncing.
- Add / Edit / Delete operate on the global context and persist to IndexedDB.
