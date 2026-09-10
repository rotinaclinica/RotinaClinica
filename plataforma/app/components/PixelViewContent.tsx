"use client";

import { useEffect } from "react";

export default function PixelViewContent({ name }: { name?: string }) {
  useEffect(() => {
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    w.fbq?.("track", "ViewContent", name ? { content_name: name } : undefined);
  }, [name]);

  return null;
}
