import { NextResponse } from "next/server";
import { publicData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** सारा public data एक ही request में (donations + leaderboard + expenditure + gallery + settings) */
export async function GET() {
  return NextResponse.json(publicData(), {
    headers: { "Cache-Control": "no-store" },
  });
}
