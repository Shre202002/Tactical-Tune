"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createAccount,
  getCurrentUser,
  signInWithPassword,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function getSafeRedirect() {
  if (typeof window === "undefined") return "/";
  const value = new URLSearchParams(window.location.search).get("redirect");
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function googleAuthUrl() {
  const redirect = getSafeRedirect();
  const params = new URLSearchParams();
  if (redirect !== "/") params.set("redirect", redirect);
  const query = params.toString();
  return query ? `/api/auth/google?${query}` : "/api/auth/google";
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error?.startsWith("google")) {
      toast.error("Google sign in failed. Please check OAuth credentials and redirect URI.");
    }
    getCurrentUser().then((user) => {
      if (user) router.push(getSafeRedirect());
    });
  }, [router]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await createAccount({ email, password, fullName });
        toast.success("Account created");
      } else {
        await signInWithPassword({ email, password });
        toast.success("Signed in");
      }
      window.location.href = getSafeRedirect();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <Link href="/" className="text-display text-2xl block text-center mb-2">
          Tactical<span className="text-primary">Tune</span>
        </Link>
        <h1 className="text-display text-3xl text-center mb-6">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>

        <Button
          type="button"
          variant="outline"
          className="mb-5 w-full"
          onClick={() => {
            window.location.href = googleAuthUrl();
          }}
        >
          <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285f4]">
            G
          </span>
          Continue with Google
        </Button>

        <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === "signup" && (
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full btn-tactical-glow">
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "signin" ? "No account?" : "Already have one?"}{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
