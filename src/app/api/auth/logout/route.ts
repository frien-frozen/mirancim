import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  // If deployed behind Vercel or any reverse proxy, use forwarded headers
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || (forwardedHost?.includes("localhost") ? "http" : "https");

  if (forwardedHost) {
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}/login`);
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

