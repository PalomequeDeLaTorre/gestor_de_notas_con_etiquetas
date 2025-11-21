"use client";
import { useState } from "react";

export default function NoteForm({ onSave }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean)
    };
    onSave(payload);
    setForm({ title: "", content: "", tags: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        className="w-full p-2 border rounded mb-2"
        placeholder="Contenido"
        rows="3"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />

      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="Etiquetas (separadas por coma)"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />

      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Crear Nota
      </button>
    </form>
  );
}
