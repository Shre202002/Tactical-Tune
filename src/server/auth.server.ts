import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ObjectId } from "mongodb";

import type { AppRole, PublicUser, UserStatus } from "@/lib/domain";
import { isStaffRole } from "@/lib/rbac";
import { sessionOptions, type SessionData } from "@/lib/session";
import { getCollection } from "./database.server";

const scrypt = promisify(scryptCallback);

export type UserDocument = {
  _id: ObjectId;
  __v?: number;
  email: string;
  emailVerified?: boolean;
  firebaseId?: string;
  googleId?: string;
  firstName?: string;
  lastName?: string;
  password_hash?: string;
  full_name?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  avatar_url?: string | null;
  role: AppRole;
  status?: UserStatus;
  address?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: Date;
  updated_at?: Date;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const PROFILE_REQUIRED_FIELDS = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["phone", "Phone"],
  ["address", "Address"],
  ["city", "City"],
  ["state", "State"],
  ["pincode", "Pincode"],
] as const;

type ProfileRequiredKey = (typeof PROFILE_REQUIRED_FIELDS)[number][0];

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asDate(value: unknown, fallback: Date) {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : fallback;
}

function splitFullName(fullName: string | null | undefined) {
  const parts = clean(fullName).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function buildFullName(firstName: string, lastName: string, fallback?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ") || clean(fallback) || null;
}

export function getMissingProfileFields(user: Pick<PublicUser, ProfileRequiredKey>) {
  return PROFILE_REQUIRED_FIELDS
    .filter(([key]) => !hasText(user[key]))
    .map(([, label]) => label);
}

function serializeUser(user: UserDocument): PublicUser {
  const now = new Date();
  const fallbackName = splitFullName(user.full_name);
  const firstName = clean(user.firstName) || fallbackName.firstName;
  const lastName = clean(user.lastName) || fallbackName.lastName;
  const phone = clean(user.phone) || null;
  const createdAt = asDate(user.createdAt, asDate(user.created_at, now));
  const updatedAt = asDate(user.updatedAt, asDate(user.updated_at, createdAt));
  const lastLogin = asDate(user.lastLogin, updatedAt);
  const publicUser = {
    id: user._id.toHexString(),
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    firebaseId: user.firebaseId || `local:${user._id.toHexString()}`,
    firstName,
    lastName,
    full_name: buildFullName(firstName, lastName, user.full_name),
    phone,
    phoneVerified: Boolean(user.phoneVerified),
    avatar_url: user.avatar_url ?? null,
    role: user.role,
    status: user.status ?? "active",
    address: clean(user.address) || null,
    landmark: clean(user.landmark) || null,
    city: clean(user.city) || null,
    state: clean(user.state) || null,
    pincode: clean(user.pincode) || null,
    lastLogin: lastLogin.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    created_at: createdAt.toISOString(),
  } satisfies Omit<PublicUser, "profile_complete" | "missing_profile_fields">;
  const missing = getMissingProfileFields(publicUser);
  return {
    ...publicUser,
    profile_complete: missing.length === 0,
    missing_profile_fields: missing,
  };
}

async function ensureUserSchema(user: UserDocument, options: { recordLogin?: boolean } = {}) {
  const now = new Date();
  const fallbackName = splitFullName(user.full_name);
  const firstName = clean(user.firstName) || fallbackName.firstName;
  const lastName = clean(user.lastName) || fallbackName.lastName;
  const createdAt = asDate(user.createdAt, asDate(user.created_at, now));
  const updatedAt = options.recordLogin ? now : asDate(user.updatedAt, asDate(user.updated_at, createdAt));
  const lastLogin = options.recordLogin ? now : asDate(user.lastLogin, updatedAt);

  const normalized: UserDocument = {
    ...user,
    __v: typeof user.__v === "number" ? user.__v : 0,
    emailVerified: Boolean(user.emailVerified),
    firebaseId: user.firebaseId || `local:${user._id.toHexString()}`,
    firstName,
    lastName,
    full_name: buildFullName(firstName, lastName, user.full_name),
    phone: clean(user.phone),
    phoneVerified: Boolean(user.phoneVerified),
    avatar_url: user.avatar_url ?? null,
    status: user.status ?? "active",
    address: clean(user.address),
    landmark: clean(user.landmark),
    city: clean(user.city),
    state: clean(user.state),
    pincode: clean(user.pincode),
    lastLogin,
    createdAt,
    updatedAt,
    created_at: createdAt,
    updated_at: updatedAt,
  };

  const users = await getCollection<UserDocument>("users");
  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        __v: normalized.__v,
        emailVerified: normalized.emailVerified,
        firebaseId: normalized.firebaseId,
        firstName: normalized.firstName,
        lastName: normalized.lastName,
        full_name: normalized.full_name,
        phone: normalized.phone,
        phoneVerified: normalized.phoneVerified,
        avatar_url: normalized.avatar_url,
        role: normalized.role,
        status: normalized.status,
        address: normalized.address,
        landmark: normalized.landmark,
        city: normalized.city,
        state: normalized.state,
        pincode: normalized.pincode,
        lastLogin: normalized.lastLogin,
        createdAt: normalized.createdAt,
        updatedAt: normalized.updatedAt,
        created_at: normalized.created_at,
        updated_at: normalized.updated_at,
      },
    },
  );

  return normalized;
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

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

async function persistSession(userId: ObjectId) {
  const session = await getSession();
  session.userId = userId.toHexString();
  await session.save();
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
  const id = new ObjectId();
  const nameParts = splitFullName(input.fullName);
  const document: UserDocument = {
    _id: id,
    __v: 0,
    email,
    emailVerified: false,
    firebaseId: `local:${id.toHexString()}`,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    password_hash: await hashPassword(input.password),
    full_name: buildFullName(nameParts.firstName, nameParts.lastName, input.fullName),
    phone: "",
    phoneVerified: false,
    avatar_url: null,
    role: "customer",
    status: "active",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    lastLogin: now,
    createdAt: now,
    updatedAt: now,
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
  if (!user || !(await verifyPassword(input.password, user.password_hash ?? ""))) {
    throw new Error("Invalid email or password.");
  }

  const normalized = await ensureUserSchema(user, { recordLogin: true });
  await persistSession(normalized._id);
  return serializeUser(normalized);
}

export type GoogleOAuthProfile = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export async function loginWithGoogle(profile: GoogleOAuthProfile) {
  const email = normalizeEmail(profile.email);
  if (!email) throw new Error("Google account did not return an email.");
  if (!profile.email_verified) throw new Error("Google email is not verified.");

  const users = await getCollection<UserDocument>("users");
  const now = new Date();
  const fallbackName = splitFullName(profile.name);
  const firstName = clean(profile.given_name) || fallbackName.firstName;
  const lastName = clean(profile.family_name) || fallbackName.lastName;
  const fullName = buildFullName(firstName, lastName, profile.name);
  const existing = await users.findOne({ email });

  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          googleId: profile.sub,
          emailVerified: true,
          firstName: clean(existing.firstName) || firstName,
          lastName: clean(existing.lastName) || lastName,
          full_name: existing.full_name || fullName,
          avatar_url: existing.avatar_url || profile.picture || null,
          status: existing.status || "active",
          lastLogin: now,
          updatedAt: now,
          updated_at: now,
        },
      },
    );
    const updated = await users.findOne({ _id: existing._id });
    if (!updated) throw new Error("Account not found.");
    const normalized = await ensureUserSchema(updated, { recordLogin: true });
    await persistSession(normalized._id);
    return serializeUser(normalized);
  }

  const id = new ObjectId();
  const document: UserDocument = {
    _id: id,
    __v: 0,
    email,
    emailVerified: true,
    firebaseId: `google:${profile.sub}`,
    googleId: profile.sub,
    firstName,
    lastName,
    password_hash: undefined,
    full_name: fullName,
    phone: "",
    phoneVerified: false,
    avatar_url: profile.picture || null,
    role: "customer",
    status: "active",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    lastLogin: now,
    createdAt: now,
    updatedAt: now,
    created_at: now,
    updated_at: now,
  };

  await users.insertOne(document);
  await persistSession(document._id);
  return serializeUser(document);
}

export async function logoutUser() {
  const session = await getSession();
  session.destroy();
}

export async function getCurrentUserFromSession(): Promise<PublicUser | null> {
  const session = await getSession();
  const userId = session.userId;
  if (!userId || !ObjectId.isValid(userId)) return null;

  const users = await getCollection<UserDocument>("users");
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    session.destroy();
    return null;
  }
  return serializeUser(await ensureUserSchema(user));
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

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaffRole(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireCompleteProfile() {
  const user = await requireUser();
  const missing = getMissingProfileFields(user);
  if (missing.length > 0) {
    throw new Error(
      `Complete your profile before placing an order. Missing: ${missing.join(", ")}.`,
    );
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "super_admin") throw new Error("Forbidden");
  return user;
}

export async function updateCurrentProfile(input: {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) {
  const current = await requireUser();
  const users = await getCollection<UserDocument>("users");
  const fallbackName = splitFullName(input.fullName ?? current.full_name);
  const firstName = clean(input.firstName) || fallbackName.firstName;
  const lastName = clean(input.lastName) || fallbackName.lastName;
  const phone = clean(input.phone);
  const address = clean(input.address);
  const landmark = clean(input.landmark);
  const city = clean(input.city);
  const state = clean(input.state);
  const pincode = clean(input.pincode);
  const candidate = {
    ...current,
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    pincode,
  };
  const missing = getMissingProfileFields(candidate);
  if (missing.length > 0) {
    throw new Error(`Please complete: ${missing.join(", ")}.`);
  }

  const now = new Date();
  await users.updateOne(
    { _id: new ObjectId(current.id) },
    {
      $set: {
        __v: 0,
        firstName,
        lastName,
        full_name: buildFullName(firstName, lastName),
        phone,
        phoneVerified: current.phone === phone ? current.phoneVerified : false,
        address,
        landmark,
        city,
        state,
        pincode,
        status: current.status || "active",
        updatedAt: now,
        updated_at: now,
      },
    },
  );
  const updated = await users.findOne({ _id: new ObjectId(current.id) });
  if (!updated) throw new Error("Account not found.");
  return serializeUser(await ensureUserSchema(updated));
}
