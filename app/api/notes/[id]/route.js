import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import { NextResponse } from "next/server";

export const dynamicParams = true;

function extractIdFromUrl(url) {
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  return id;
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    let id = params?.id;
    if (!id) {
      id = extractIdFromUrl(new URL(request.url));
    }

    console.log("✏️ Editando nota ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await Note.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Error al actualizar nota:", err);
    return NextResponse.json({ error: "Error actualizando nota" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    let id = params?.id;
    if (!id) {
      id = extractIdFromUrl(new URL(request.url));
    }

    console.log("🔍 Obteniendo nota ID:", id);
    
    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" }, 
        { status: 400 }
      );
    }

    const note = await Note.findById(id);
    return NextResponse.json(note);
  } catch (err) {
    console.error("❌ Error obteniendo nota:", err);
    return NextResponse.json({ error: "Error obteniendo nota" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    let id = params?.id;
    if (!id) {
      const url = new URL(request.url);
      id = extractIdFromUrl(url);
      console.log("🔍 ID extraído de URL:", id);
    }

    console.log("🗑️ Eliminando nota con ID:", id);

    if (!id) {
      console.error("❌ ID no disponible");
      return NextResponse.json(
        { error: "ID de nota no proporcionado" }, 
        { status: 400 }
      );
    }

    const existingNote = await Note.findById(id);
    if (!existingNote) {
      console.error("❌ Nota no encontrada con ID:", id);
      return NextResponse.json(
        { error: "Nota no encontrada" }, 
        { status: 404 }
      );
    }

    const deletedNote = await Note.findByIdAndDelete(id);

    console.log("✅ Nota eliminada:", deletedNote?.title);
    return NextResponse.json({ 
      success: true,
      message: "Nota eliminada correctamente",
      deletedNote 
    });

  } catch (err) {
    console.error("❌ Error al eliminar nota:", err);
    return NextResponse.json(
      { error: "Error eliminando nota: " + err.message }, 
      { status: 500 }
    );
  }
}