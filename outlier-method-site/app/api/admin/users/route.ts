import { NextResponse } from "next/server";
import { listUsers } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ users: await listUsers() });
}
