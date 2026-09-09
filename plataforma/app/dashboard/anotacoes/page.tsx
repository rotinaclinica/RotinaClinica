import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import NotesClient from "./NotesClient";

export const metadata = { title: "Anotações" };

export default async function AnotacoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = await db.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, content: true, createdAt: true, updatedAt: true },
  });

  return <NotesClient initialNotes={notes.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }))} />;
}
