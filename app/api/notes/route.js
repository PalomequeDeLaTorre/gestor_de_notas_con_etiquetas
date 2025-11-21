import Note from "@/models/Note";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const notes = await Note.find().sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const note = await Note.create({
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    archived: false
  });

  return NextResponse.json(note);
}