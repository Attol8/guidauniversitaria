import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term") || "";
  if (!term) return NextResponse.json([]);

  const base =
    process.env.NEXT_PUBLIC_FUNCTIONS_BASE ||
    "http://127.0.0.1:5001/guidauniversitaria/us-central1";

  const url = `${base}/search_courses?term=${encodeURIComponent(term)}`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}