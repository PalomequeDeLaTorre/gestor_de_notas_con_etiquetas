"use client";

export default function NoteList({ notes, onDelete, onArchive }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map(note => (
        <div key={note._id} className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-bold">{note.title}</h2>
          <p className="mt-2">{note.content}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onArchive(note._id, !note.archived)}
              className="px-2 py-1 bg-yellow-300 rounded text-sm"
            >
              {note.archived ? "Desarchivar" : "Archivar"}
            </button>

            <button
              onClick={() => onDelete(note._id)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
