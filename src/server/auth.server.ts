import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { ObjectId } from "mongodb";
import { useSession as getServerSession } from "@tanstack/react-start/server";

import type { AppRole, PublicUser } from "@/lib/domain";
import { getCollection } from "./database.server";

const scrypt = promisify(scryptCallback);
const SESSION_NAME = "tactical_hub_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export type UserDocument = {
  _id: ObjectId;
  email: string;
  password_hash: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: Date;
  updated_at: Date;
};

type SessionData = {
  userId: string;
};

function sessionPassword() {
  const configured = process.env.SESSION_SECRET || process.env.db_password;
  if (!configured) {
    throw new Error("SESSION_SECRET is required.");
  }
  return configured.length >= 32
    ? configured
    : createHash("sha256").update(configured).digest("hex");
}

function sessionConfig() {
  return {
    password: sessionPassword(),
    name: SESSION_NAME,
    maxAge: SESSION_MAX_AGE,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    },
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function serializeUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toHexString(),
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    avatar_url: user.avatar_url,
    role: user.role,
    created_at: user.created_at.toISOString(),
  };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, storedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !storedHex) return false;
  const stored = Buffer.from(storedHex, "hex");
  const derived = (await scrypt(password, salt, stored.length)) as Buffer;
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

async function persistSession(userId: ObjectId) {
  const session = await getServerSession<SessionData>(sessionConfig());
  await session.update({ userId: userId.toHexString() });
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  const email = normalizeEmail(input.email);
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const users = await getCollection<UserDocument>("users");
  const existing = await users.findOne({ email });
  if (existing) throw new Error("An account with this email already exists.");

  const now = new Date();
  const document: UserDocument = {
    _id: new ObjectId(),
    email,
    password_hash: await hashPassword(input.password),
    full_name: input.fullName.trim() || null,
    phone: null,
    avatar_url: null,
    role: "customer",
    created_at: now,
    updated_at: now,
  };

  await users.insertOne(document);
  await persistSession(document._id);
  return serializeUser(document);
}

export async function loginUser(input: { email: string; password: string }) {
  const users = await getCollection<UserDocument>("users");
  const user = await users.findOne({ email: normalizeEmail(input.email) });
  if (!user || !(await verifyPassword(input.password, user.password_hash))) {
    throw new Error("Invalid email or password.");
  }

  await persistSession(user._id);
  return serializeUser(user);
}

export async function logoutUser() {
  const session = await getServerSession<SessionData>(sessionConfig());
  await session.clear();
}

export async function getCurrentUserFromSession(): Promise<PublicUser | null> {
  const session = await getServerSession<SessionData>(sessionConfig());
  const userId = session.data.userId;
  if (!userId || !ObjectId.isValid(userId)) return null;

  const users = await getCollection<UserDocument>("users");
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    await session.clear();
    return null;
  }
  return serializeUser(user);
}

export async function requireUser() {
  const user = await getCurrentUserFromSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "super_admin") throw new Error("Forbidden");
  return user;
}

export async function updateCurrentProfile(input: { fullName: string; phone: string }) {
  const current = await requireUser();
  const users = await getCollection<UserDocument>("users");
  await users.updateOne(
    { _id: new ObjectId(current.id) },
    {
      $set: {
        full_name: input.fullName.trim() || null,
        phone: input.phone.trim() || null,
        updated_at: new Date(),
      },
    },
  );
  const updated = await users.findOne({ _id: new ObjectId(current.id) });
  if (!updated) throw new Error("Account not found.");
  return serializeUser(updated);
}
