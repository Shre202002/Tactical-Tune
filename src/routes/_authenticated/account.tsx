import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchAccount, saveAccount } from "@/lib/account";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
});

function AccountPage() {
  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchAccount();
      setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        email: data.email,
      });
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAccount({
        data: {
          fullName: profile.full_name,
          phone: profile.phone,
        },
      });
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-tactical py-10 max-w-2xl">
        <h1 className="text-display text-4xl mb-6">Account</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <form onSubmit={save} className="space-y-4 bg-card border border-border rounded p-6">
            <div>
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div>
              <Label>Full name</Label>
              <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <Button type="submit" disabled={saving} className="btn-tactical-glow">{saving ? "Saving..." : "Save"}</Button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
