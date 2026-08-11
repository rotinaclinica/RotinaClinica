"use client";

import { useEffect, useRef } from "react";

export default function ThumbnailImage({
  aulaId,
  alt,
  thumbLocal,
}: {
  aulaId: number;
  alt: string;
  thumbLocal?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const src = thumbLocal ? `/${thumbLocal}` : `/api/cursos/${aulaId}/thumb`;

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      imgRef.current.style.opacity = "1";
    }
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
      onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = "1"; }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}
