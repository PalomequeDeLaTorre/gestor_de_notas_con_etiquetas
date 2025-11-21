"use client";

export default function TagFilter({ tags, setSelectedTag }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button onClick={() => setSelectedTag(null)} className="px-3 py-1 bg-gray-300 rounded text-sm">Todas</button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => setSelectedTag(tag)}
          className="px-3 py-1 bg-blue-200 rounded text-sm"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
