import { createHash } from "node:crypto";
import type { SessionOptions } from "iron-session";

export type SessionData = {
  userId?: string;
};

const SESSION_NAME = "tactical_hub_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function sessionPassword() {
  const configured = process.env.SESSION_SECRET || process.env.db_password;
  if (!configured) {
    throw new Error("SESSION_SECRET is required.");
  }
  return configured.length >= 32
    ? configured
    : createHash("sha256").update(configured).digest("hex");
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword(),
  cookieName: SESSION_NAME,
  ttl: SESSION_MAX_AGE,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  },
};
