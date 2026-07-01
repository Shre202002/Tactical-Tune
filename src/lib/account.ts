"use server";

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pincodeSearch = require("india-pincode-search") as {
  search: (query: string | number) => PincodeSearchResult[];
};

type PincodeSearchResult = {
  state?: string;
  city?: string;
  district?: string;
  village?: string;
  office?: string;
  pincode?: string;
};

export async function fetchAccount() {
  const { requireUser } = await import("@/server/auth.server");
  return requireUser();
}

export async function saveAccount(input: {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const { updateCurrentProfile } = await import("@/server/auth.server");
  return updateCurrentProfile(input);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function lookupPincode(pincode: string) {
  const normalized = pincode.replace(/\D/g, "");
  if (!/^\d{6}$/.test(normalized)) {
    throw new Error("Enter a valid 6-digit pincode.");
  }

  const [match] = pincodeSearch.search(normalized);
  if (!match?.state) {
    throw new Error("No city/state found for this pincode.");
  }

  return {
    pincode: normalized,
    city: titleCase(match.city || match.district || match.village || ""),
    state: titleCase(match.state),
  };
}
