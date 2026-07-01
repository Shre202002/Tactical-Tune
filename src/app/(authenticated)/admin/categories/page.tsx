"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteAdminCategory, fetchAdminCategories, fetchAdminDashboard, saveAdminCategory } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type CatForm = { id?: string; name: string; slug: string; description: string; sort_order: number };
const empty: CatForm = { name: "", slug: "", description: "", sort_order: 0 };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CatForm | null>(null);

  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: () => fetchAdminCategories(),
  });

  const { data: adminContext } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminDashboard(),
  });

  async function save() {
    if (!editing) return;
    try {
      await saveAdminCategory(editing);
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-cats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save category");
    }
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    try {
      await deleteAdminCategory(id);
      qc.invalidateQueries({ queryKey: ["admin-cats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete category");
    }
  }

  return (
    <div>
      {adminContext && !adminContext.permissions.canManageCategories ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl">Categories are admin-only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your role can use existing categories while editing products, but cannot create or delete categories.
          </p>
        </div>
      ) : (
      <>
      <div className="flex justify-between mb-6">
        <h1 className="text-display text-3xl">Categories</h1>
        <Button onClick={() => { setEditing(empty); setOpen(true); }} className="btn-tactical-glow"><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Slug</th><th className="p-3 text-right">Order</th><th /></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">{c.name}</td>
                <td className="p-3 font-mono text-xs">{c.slug}</td>
                <td className="p-3 text-right">{c.sort_order}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => { setEditing({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", sort_order: c.sort_order }); setOpen(true); }} className="text-primary"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} category</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <div><Label>Description</Label><Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <Button onClick={save} className="w-full btn-tactical-glow">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
}
