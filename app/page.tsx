"use client";

import { useEffect, useState } from "react";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  archived?: boolean;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(""); 
  const [viewArchived, setViewArchived] = useState(false); 

  // CREAR NOTA
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // EDITAR NOTA
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  const loadNotes = async () => {
    const res = await fetch("/api/notes");
    setNotes(await res.json());
    setHasSearched(false); 
  };

  const executeSearch = async () => {
    if (search.trim() === "") {
      loadNotes();
      return;
    }

    const res = await fetch(`/api/notes/search?q=${search}`);
    setNotes(await res.json());
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  // VALIDACIÓN Y CREACIÓN
  const createNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError("⚠️ El título y el contenido son obligatorios.");
      return;
    }

    setError(""); 

    await fetch("/api/notes", {
      method: "POST",
      body: JSON.stringify({
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()),
        archived: false, 
      }),
    });

    setTitle("");
    setContent("");
    setTags("");
    loadNotes();
  };

  const deleteNote = async (id: string) => {
    if(!confirm("¿Estás seguro de eliminar esta nota permanentemente?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (hasSearched) {
       executeSearch();
    } else {
       loadNotes();
    }
  };

  // ARCHIVAR / DESARCHIVAR 
  const toggleArchive = async (note: Note) => {
    await fetch(`/api/notes/${note._id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...note,
        archived: !note.archived,
      }),
    });
    
    setNotes(prevNotes => 
        prevNotes.map(n => n._id === note._id ? { ...n, archived: !n.archived } : n)
    );
  };

  // EDITAR NOTA

  const openEdit = (note: Note) => {
    setError(""); 
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(", "));
  };

  const updateNote = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setError("⚠️ El título y el contenido son obligatorios.");
      return;
    }

    await fetch(`/api/notes/${editingNote!._id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
        tags: editTags.split(",").map((t) => t.trim()),
        archived: editingNote?.archived || false
      }),
    });

    setEditingNote(null);
    setError("");
    
    if (hasSearched) {
        executeSearch();
    } else {
        loadNotes();
    }
  };

  // BOTÓN PARA AÑADIR ETIQUETAS 
  const addTag = (tag: string) => {
    if (tags.trim() === "") {
      setTags(tag);
    } else {
      setTags((prevTags) => `${prevTags}, ${tag}`);
    }
  };

  const addEditTag = (tag: string) => {
    if (editTags.trim() === "") {
      setEditTags(tag);
    } else {
      setEditTags((prevTags) => `${prevTags}, ${tag}`);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      await loadNotes();
    };
    fetchNotes();
  }, []);

  // FILTRAR NOTAS SEGÚN LA VISTA ACTUAL (ACTIVAS VS ARCHIVADAS)
  const filteredNotes = notes.filter((note) => 
    viewArchived ? note.archived === true : !note.archived
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            📝 Mis Notas
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Organiza tus ideas de forma inteligente
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative flex flex-col gap-2">
          <div className="relative">
            <input
                type="text"
                placeholder="Buscar notas..."
                className="w-full px-4 py-3 sm:py-4 pr-14 border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown} 
            />
            
            {/* BOTÓN DE BÚSQUEDA */}
            <button 
                onClick={executeSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                title="Buscar"
            >
                <span className="text-xl">🔍</span>
            </button>
          </div>

          {/* MENSAJES DE RESULTADO DE BÚSQUEDA */}
          {hasSearched && (
            <div className={`text-center text-sm font-medium p-2 rounded-lg border ${filteredNotes.length > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {filteredNotes.length > 0 
                    ? `✅ Se encontraron ${filteredNotes.length} nota(s).` 
                    : `❌ No se encontraron notas con ese nombre en esta vista.`}
            </div>
          )}
        </div>

        {/* CREAR NOTA */}
        {!viewArchived && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>✨</span> Crear Nueva Nota
            </h2>

            {error && !editingNote && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            <input
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Título de la nota *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px] sm:min-h-[120px] resize-y text-sm sm:text-base"
              placeholder="Escribe el contenido de tu nota... *"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <input
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Etiquetas separadas por comas (ej: trabajo, importante)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-2 font-medium">
                Etiquetas rápidas:
              </p>
              <div className="flex gap-2 flex-wrap">
                {['importante', 'trabajo', 'personal', 'urgente', 'ideas'].map((tag) => (
                   <button
                   key={tag}
                   type="button"
                   onClick={() => addTag(tag)}
                   className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-${tag === 'importante' || tag === 'urgente' ? 'red' : tag === 'trabajo' ? 'blue' : tag === 'personal' ? 'green' : 'purple'}-50 hover:bg-opacity-80 text-${tag === 'importante' || tag === 'urgente' ? 'red' : tag === 'trabajo' ? 'blue' : tag === 'personal' ? 'green' : 'purple'}-700 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 border border-slate-200`}
                 >
                   + {tag}
                 </button>
                ))}
              </div>
            </div>

            <button
              onClick={createNote}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
            >
              ✅ Crear Nota
            </button>
          </div>
        )}

        {/* LISTA DE NOTAS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>{viewArchived ? '🗄️' : '📚'}</span> {viewArchived ? 'Notas Archivadas' : 'Mis Notas'} ({filteredNotes.length})
            </h2>
            
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setViewArchived(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${!viewArchived ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Activas
              </button>
              <button
                onClick={() => setViewArchived(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewArchived ? 'bg-white shadow text-blue-700' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Archivadas
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredNotes.map((note) => (
              <div 
                key={note._id} 
                className={`bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-200 p-4 sm:p-6 transition-all duration-200 hover:scale-[1.02] ${note.archived ? 'opacity-75 grayscale-[0.3]' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg sm:text-xl text-slate-800 break-words flex-1">
                    {note.title}
                    </h3>
                    {note.archived && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded ml-2">Archivada</span>}
                </div>

                <p className="text-slate-600 mb-4 text-sm sm:text-base break-words whitespace-pre-wrap">
                  {note.content}
                </p>

                
                { /* ETIQUETAS */ }
                <div className="flex gap-2 flex-wrap mb-4">
                  {note.tags.map((t, index) => (
                    <span 
                      key={`${t}-${index}`} 
                      className="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-full text-xs sm:text-sm font-medium border border-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => openEdit(note)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 border border-blue-200 text-sm"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => toggleArchive(note)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors duration-200 border text-sm ${note.archived ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'}`}
                  >
                     {note.archived ? '📤 Desarchivar' : '🗄️ Archivar'}
                  </button>

                  <button
                    onClick={() => deleteNote(note._id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 border border-red-200 text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300 mt-4">
              <p className="text-slate-500 text-base sm:text-lg">
                {hasSearched 
                    ? '❌ Intenta con otro término de búsqueda.' 
                    : (viewArchived 
                        ? '📭 No tienes notas archivadas.' 
                        : '📭 No hay notas activas. ¡Crea una o revisa el archivo!')}
              </p>
            </div>
          )}
        </div>

        {/* MODAL DE EDICIÓN */}
        {editingNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4">

              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <span>✏️</span> Editar Nota
              </h2>

               {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
                    {error}
                </div>
                )}

              <input
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Título"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <textarea
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px] resize-y text-sm sm:text-base"
                placeholder="Contenido"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />

              <input
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Etiquetas"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />

               <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-2 font-medium">
                  Etiquetas rápidas:
                </p>
                <div className="flex gap-2 flex-wrap">
                {['importante', 'trabajo', 'personal', 'urgente', 'ideas'].map((tag) => (
                   <button
                   key={tag}
                   type="button"
                   onClick={() => addEditTag(tag)}
                   className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-${tag === 'importante' || tag === 'urgente' ? 'red' : tag === 'trabajo' ? 'blue' : tag === 'personal' ? 'green' : 'purple'}-50 hover:bg-opacity-80 text-${tag === 'importante' || tag === 'urgente' ? 'red' : tag === 'trabajo' ? 'blue' : tag === 'personal' ? 'green' : 'purple'}-700 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 border border-slate-200`}
                 >
                   + {tag}
                 </button>
                ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                <button
                  onClick={() => { setEditingNote(null); setError(""); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 border border-slate-300 text-sm sm:text-base"
                >
                  ❌ Cancelar
                </button>

                <button
                  onClick={updateNote}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  💾 Guardar cambios
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}