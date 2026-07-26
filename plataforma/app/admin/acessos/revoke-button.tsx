"use client";

import { revokeAccess } from "./actions";

export function RevokeButton({ enrollmentId }: { enrollmentId: string }) {
  return (
    <form action={revokeAccess.bind(null, enrollmentId)}>
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600"
        onClick={(e) => { if (!confirm("Revogar acesso?")) e.preventDefault(); }}
      >
        Revogar
      </button>
    </form>
  );
}
