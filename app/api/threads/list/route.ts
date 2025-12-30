import { NextRequest } from "next/server";
import { getMyThreads } from "@/lib/threads";

export async function GET(req: NextRequest) {
  try {
    if (!process.env.THREADS_LONG_LIVED_TOKEN) {
      return Response.json(
        { error: "Threads integration not configured. Missing THREADS_LONG_LIVED_TOKEN." },
        { status: 500 }
      );
    }

    if (!process.env.THREADS_USER_ID) {
      return Response.json(
        { error: "Threads integration not configured. Missing THREADS_USER_ID." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const after = searchParams.get("after") || undefined;
    
    const data = await getMyThreads({ limit, after });
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to fetch Threads data" },
      { status: 500 }
    );
  }
}
