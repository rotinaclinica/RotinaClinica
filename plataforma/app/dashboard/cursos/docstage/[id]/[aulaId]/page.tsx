import { getDocstageModulo, getDocstageAula } from "@/lib/docstage-data";
import { notFound, redirect } from "next/navigation";
import DocstagePlayerClient from "./PlayerClient"; // docstage player

export default async function DocstageAulaPage({
  params,
}: {
  params: Promise<{ id: string; aulaId: string }>;
}) {
  const { id, aulaId } = await params;
  const moduloId = id;
  const aulaIdNum = Number(aulaId);

  if (!getDocstageModulo(moduloId)) notFound();
  if (!getDocstageAula(moduloId, aulaIdNum)) redirect(`/dashboard/cursos/docstage/${moduloId}`);

  return <DocstagePlayerClient moduloId={moduloId} aulaId={aulaIdNum} />;
}
