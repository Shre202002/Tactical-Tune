import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const GOOGLE_STATE_COOKIE = "tt_google_oauth_state";
const GOOGLE_REDIRECT_COOKIE = "tt_auth_redirect";

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/auth?error=google_config", request.url));
  }

  const state = randomBytes(32).toString("hex");
  const redirectTo = safeRedirectPath(request.nextUrl.searchParams.get("redirect"));
  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  response.cookies.set(GOOGLE_REDIRECT_COOKIE, redirectTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}

