"use client";

export default function ThumbnailImage({ aulaId, alt }: { aulaId: number; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/cursos/${aulaId}/thumb`}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
      onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = "1"; }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}
