"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function LessonPlayer({
  lessonId,
  title,
}: {
  lessonId: string;
  title: string;
}) {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${lessonId}/playback-url`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setPlaybackUrl(d.url))
      .catch(() => setError(true));
  }, [lessonId]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        Não foi possível carregar o vídeo.
      </div>
    );
  }

  if (!playbackUrl) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        Carregando vídeo...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-black">
      <MuxPlayer
        src={playbackUrl}
        metadata={{ video_title: title }}
        className="w-full"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="p-6 bg-zinc-900">
        <h1 className="text-white text-xl font-semibold">{title}</h1>
      </div>
    </div>
  );
}
