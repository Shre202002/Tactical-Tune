"use client";

import { useEffect, useState } from "react";
import { fetchAccount, lookupPincode, saveAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicUser } from "@/lib/domain";
import { toast } from "sonner";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyProfile: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function formFromUser(user: PublicUser): ProfileForm {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    address: user.address ?? "",
    landmark: user.landmark ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    pincode: user.pincode ?? "",
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [account, setAccount] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "loading" | "found" | "error"
  >("idle");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [showCheckoutHint, setShowCheckoutHint] = useState(false);

  useEffect(() => {
    setShowCheckoutHint(new URLSearchParams(window.location.search).has("completeProfile"));
    (async () => {
      const data = await fetchAccount();
      setAccount(data);
      setProfile(formFromUser(data));
      setLoading(false);
    })().catch((error) => {
      toast.error(error instanceof Error ? error.message : "Could not load profile");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const pincode = profile.pincode.replace(/\D/g, "");
    if (pincode !== profile.pincode) {
      setProfile((current) => ({ ...current, pincode }));
      return;
    }

    if (pincode.length !== 6) {
      setPincodeStatus("idle");
      setPincodeMessage("");
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setPincodeStatus("loading");
      setPincodeMessage("Finding city and state...");
      try {
        const result = await lookupPincode(pincode);
        if (!active) return;
        setProfile((current) =>
          current.pincode === pincode
            ? { ...current, city: result.city, state: result.state }
            : current,
        );
        setPincodeStatus("found");
        setPincodeMessage(`${result.city}, ${result.state}`);
      } catch (error) {
        if (!active) return;
        setPincodeStatus("error");
        setPincodeMessage(
          error instanceof Error
            ? error.message
            : "Could not find city/state for this pincode.",
        );
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [profile.pincode]);

  function update(key: keyof ProfileForm, value: string) {
    setProfile((current) => ({
      ...current,
      [key]: key === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await saveAccount({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        landmark: profile.landmark,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      });
      setAccount(updated);
      setProfile(formFromUser(updated));
      setShowCheckoutHint(false);
      toast.success("Profile completed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save profile",
      );
    } finally {
      setSaving(false);
    }
  }

  const missingFields = account?.missing_profile_fields ?? [];
  const profileComplete = account?.profile_complete ?? false;

  return (
    <div className="min-h-screen bg-background">
      <main className="container-tactical py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-display text-sm text-primary tracking-widest mb-2">
              USER PROFILE
            </p>
            <h1 className="text-display text-4xl">Complete profile</h1>
            <p className="text-muted-foreground mt-2">
              Add your contact and delivery details before placing an order.
            </p>
          </div>
          {account && (
            <div
              className={`text-display text-xs tracking-widest rounded-sm border px-3 py-2 ${
                profileComplete
                  ? "border-success text-success"
                  : "border-warning text-warning"
              }`}
            >
              {profileComplete ? "PROFILE COMPLETE" : "PROFILE INCOMPLETE"}
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading profile...</p>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <form
              onSubmit={save}
              className="space-y-6 bg-card border border-border rounded p-6"
            >
              {(showCheckoutHint || missingFields.length > 0) && (
                <div className="rounded-sm border border-warning/60 bg-warning/10 p-4 text-sm">
                  <div className="font-semibold text-warning mb-1">
                    Complete your profile to place orders.
                  </div>
                  {missingFields.length > 0 && (
                    <p className="text-muted-foreground">
                      Missing: {missingFields.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <section>
                <h2 className="text-display text-xl mb-4">Identity</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-display text-xl mb-4">Delivery address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => update("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={profile.landmark}
                      onChange={(e) => update("landmark", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={profile.pincode}
                      onChange={(e) => update("pincode", e.target.value)}
                      required
                    />
                    {pincodeMessage && (
                      <p
                        className={`mt-1 text-xs ${
                          pincodeStatus === "error"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {pincodeMessage}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder={
                        pincodeStatus === "loading" ? "Auto-filling..." : ""
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder={
                        pincodeStatus === "loading" ? "Auto-filling..." : ""
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              <Button type="submit" disabled={saving} className="btn-tactical-glow">
                {saving ? "Saving..." : "Save profile"}
              </Button>
            </form>

            {account && (
              <aside className="bg-card border border-border rounded p-6 h-fit space-y-4">
                <h2 className="text-display text-xl">Account details</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Role</div>
                    <div className="capitalize">{account.role.replace(/_/g, " ")}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="capitalize">{account.status}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email verified</div>
                    <div>{account.emailVerified ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone verified</div>
                    <div>{account.phoneVerified ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last login</div>
                    <div>{formatDate(account.lastLogin)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Joined</div>
                    <div>{formatDate(account.createdAt)}</div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
