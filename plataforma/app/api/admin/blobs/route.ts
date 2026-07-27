import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  const { blobs } = await list();
  return NextResponse.json(
    blobs.map((b) => ({ pathname: b.pathname, url: b.url }))
  );
}
