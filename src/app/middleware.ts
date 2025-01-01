import { getSession } from "@/lib/sessions";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  console.log("session", session);

  if (request.nextUrl.pathname === "/profile") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
