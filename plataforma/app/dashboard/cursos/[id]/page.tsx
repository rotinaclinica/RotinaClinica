import { getAulaById } from "@/lib/cursos-data";
import { redirect } from "next/navigation";
import PlayerClient from "./PlayerClient";

export default async function AulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonId = Number(id);
  if (!getAulaById(lessonId)) redirect("/dashboard/cursos/destravando");
  return <PlayerClient lessonId={lessonId} />;
}
