import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Auth is enforced in app/(dashboard)/layout.tsx via auth() server-side.
// This pass-through satisfies Next.js 16's requirement that middleware.ts
// exports a function; it performs no logic of its own.
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}
