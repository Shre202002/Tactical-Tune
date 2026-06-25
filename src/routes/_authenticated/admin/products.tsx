import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  short_description: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  category_slug: string;
  caliber: string;
  power_plant: string;
  velocity: string;
  is_featured: boolean;
  is_active: boolean;
  licence_required: boolean;
  image_url: string;
};

const empty: ProductForm = {
  name: "", slug: "", brand: "", short_description: "", description: "",
  price: 0, compare_at_price: null, stock: 0, category_slug: "",
  caliber: "", power_plant: "", velocity: "",
  is_featured: false, is_active: true, licence_required: false, image_url: "",
};

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [open, setOpen] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("slug,name").order("name");
      return data ?? [];
    },
  });

  function openNew() {
    setEditing(empty);
    setOpen(true);
  }

  function openEdit(p: any) {
    setEditing({
      id: p.id,
      name: p.name, slug: p.slug, brand: p.brand ?? "",
      short_description: p.short_description ?? "", description: p.description ?? "",
      price: p.price, compare_at_price: p.compare_at_price,
      stock: p.stock, category_slug: p.category_slug ?? "",
      caliber: p.caliber ?? "", power_plant: p.power_plant ?? "", velocity: p.velocity ?? "",
      is_featured: p.is_featured, is_active: p.is_active, licence_required: p.licence_required,
      image_url: p.images?.[0]?.url ?? "",
    });
    setOpen(true);
  }

  async function handleFileUpload(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `admin-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(error.message);
      return null;
    }
    // Create long-lived signed URL
    const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 3153600000);
    return data?.signedUrl ?? null;
  }

  async function save() {
    if (!editing) return;
    const { id, image_url, ...rest } = editing;
    const payload: any = {
      ...rest,
      images: image_url ? [{ url: image_url, alt: editing.name, order: 0 }] : [],
      specifications: [],
      tags: [],
    };
    let err;
    if (id) {
      ({ error: err } = await supabase.from("products").update(payload).eq("id", id));
    } else {
      ({ error: err } = await supabase.from("products").insert(payload));
    }
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Saved");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-display text-3xl">Products</h1>
        <Button onClick={openNew} className="btn-tactical-glow"><Plus className="w-4 h-4 mr-1" /> New product</Button>
      </div>

      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Brand</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.brand}</td>
                <td className="p-3 text-right">₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td className="p-3 text-right">{p.stock}</td>
                <td className="p-3 text-center">{p.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-primary"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(p.id)} className="text-destructive"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "New"} product</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                <div><Label>Brand</Label><Input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></div>
                <div><Label>Category</Label>
                  <select className="w-full border border-input rounded px-3 py-2 bg-background" value={editing.category_slug} onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}>
                    <option value="">—</option>
                    {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div><Label>Price ₹</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div><Label>Compare-at price ₹</Label><Input type="number" value={editing.compare_at_price ?? ""} onChange={(e) => setEditing({ ...editing, compare_at_price: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>Stock</Label><Input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></div>
                <div><Label>Caliber</Label><Input value={editing.caliber} onChange={(e) => setEditing({ ...editing, caliber: e.target.value })} /></div>
                <div><Label>Power plant</Label><Input value={editing.power_plant} onChange={(e) => setEditing({ ...editing, power_plant: e.target.value })} /></div>
                <div><Label>Velocity</Label><Input value={editing.velocity} onChange={(e) => setEditing({ ...editing, velocity: e.target.value })} /></div>
              </div>
              <div><Label>Short description</Label><Textarea value={editing.short_description} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div>
                <Label>Product image</Label>
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  toast.loading("Uploading...");
                  const url = await handleFileUpload(f);
                  toast.dismiss();
                  if (url) {
                    setEditing({ ...editing, image_url: url });
                    toast.success("Uploaded");
                  }
                }} />
                {editing.image_url && <img src={editing.image_url} alt="" className="mt-2 w-32 h-32 object-cover rounded" />}
              </div>
              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>
                <label className="flex items-center gap-2"><Switch checked={editing.is_featured} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} /> Featured</label>
                <label className="flex items-center gap-2"><Switch checked={editing.licence_required} onCheckedChange={(v) => setEditing({ ...editing, licence_required: v })} /> Licence required</label>
              </div>
              <Button onClick={save} className="w-full btn-tactical-glow">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
