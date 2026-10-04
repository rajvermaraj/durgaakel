import { NextResponse } from "next/server";
import { isAdmin, usingDefaultPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { authed: isAdmin(), defaultPassword: usingDefaultPassword() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
