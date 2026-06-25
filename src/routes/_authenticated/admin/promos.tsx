import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/promos")({
  component: AdminPromos,
});

type PromoForm = {
  id?: string; code: string; description: string;
  percent_off: number | null; flat_off: number | null;
  min_order_amount: number; max_uses: number | null; is_active: boolean;
};
const empty: PromoForm = { code: "", description: "", percent_off: null, flat_off: null, min_order_amount: 0, max_uses: null, is_active: true };

function AdminPromos() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoForm | null>(null);
  const { data: promos = [] } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: async () => (await supabase.from("promos").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function save() {
    if (!editing) return;
    const { id, ...rest } = editing;
    const { error } = id
      ? await supabase.from("promos").update(rest).eq("id", id)
      : await supabase.from("promos").insert(rest);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["admin-promos"] }); }
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("promos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-promos"] });
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-display text-3xl">Promos</h1>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="btn-tactical-glow"><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">Discount</th><th className="p-3">Uses</th><th className="p-3">Active</th><th /></tr></thead>
          <tbody>
            {promos.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-mono">{p.code}</td>
                <td className="p-3">{p.percent_off ? `${p.percent_off}%` : `₹${p.flat_off}`}</td>
                <td className="p-3 text-center">{p.uses_count}{p.max_uses ? `/${p.max_uses}` : ""}</td>
                <td className="p-3 text-center">{p.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => { setEditing({ id: p.id, code: p.code, description: p.description ?? "", percent_off: p.percent_off, flat_off: p.flat_off, min_order_amount: Number(p.min_order_amount), max_uses: p.max_uses, is_active: p.is_active }); setOpen(true); }} className="text-primary"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(p.id)} className="text-destructive"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} promo</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></div>
              <div><Label>Description</Label><Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>% off</Label><Input type="number" value={editing.percent_off ?? ""} onChange={(e) => setEditing({ ...editing, percent_off: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>Flat ₹ off</Label><Input type="number" value={editing.flat_off ?? ""} onChange={(e) => setEditing({ ...editing, flat_off: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>Min order ₹</Label><Input type="number" value={editing.min_order_amount} onChange={(e) => setEditing({ ...editing, min_order_amount: Number(e.target.value) })} /></div>
                <div><Label>Max uses</Label><Input type="number" value={editing.max_uses ?? ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value ? Number(e.target.value) : null })} /></div>
              </div>
              <label className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>
              <Button onClick={save} className="w-full btn-tactical-glow">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
