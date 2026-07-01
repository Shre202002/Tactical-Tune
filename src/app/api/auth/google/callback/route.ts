import { NextResponse, type NextRequest } from "next/server";
import { loginWithGoogle, type GoogleOAuthProfile } from "@/server/auth.server";

const GOOGLE_STATE_COOKIE = "tt_google_oauth_state";
const GOOGLE_REDIRECT_COOKIE = "tt_auth_redirect";

function safeRedirectPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function authRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error)}`, request.url));
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (!clientId || !clientSecret) return authRedirect(request, "google_config");
  if (!code || !state || !expectedState || state !== expectedState) {
    return authRedirect(request, "google_state");
  }

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) return authRedirect(request, "google_token");
  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenPayload.access_token) return authRedirect(request, "google_token");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });

  if (!profileResponse.ok) return authRedirect(request, "google_profile");
  const profile = (await profileResponse.json()) as GoogleOAuthProfile;

  try {
    await loginWithGoogle(profile);
  } catch {
    return authRedirect(request, "google_account");
  }

  const redirectTo = safeRedirectPath(request.cookies.get(GOOGLE_REDIRECT_COOKIE)?.value);
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  response.cookies.delete(GOOGLE_REDIRECT_COOKIE);
  return response;
}

