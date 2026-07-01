"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  deleteAdminProduct,
  fetchAdminDashboard,
  fetchAdminCategories,
  fetchAdminProducts,
  saveAdminProduct,
  uploadProductImage,
} from "@/lib/admin";
import type { CategoryRow, ProductImage, ProductRow } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
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
  track_inventory: boolean;
  requiresHandling: boolean;
  requiresPremiumProtection: boolean;
  visibility_priority: number;
  images: ProductImage[];
  tags: string[];
};

const empty: ProductForm = {
  name: "",
  slug: "",
  brand: "",
  sku: "",
  short_description: "",
  description: "",
  price: 0,
  compare_at_price: null,
  stock: 0,
  category_slug: "",
  caliber: "",
  power_plant: "",
  velocity: "",
  is_featured: false,
  is_active: true,
  licence_required: false,
  track_inventory: true,
  requiresHandling: false,
  requiresPremiumProtection: false,
  visibility_priority: 0,
  images: [],
  tags: [],
};

const PRODUCT_DRAFT_KEY = "tacticaltune:admin-product-draft:v1";

type ProductDraft = {
  savedAt: string;
  form: ProductForm;
};

function loadProductDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRODUCT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductDraft;
    return parsed.form ? parsed : null;
  } catch {
    return null;
  }
}

function saveProductDraft(form: ProductForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PRODUCT_DRAFT_KEY,
    JSON.stringify({
      savedAt: new Date().toISOString(),
      form,
    } satisfies ProductDraft),
  );
}

function clearProductDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PRODUCT_DRAFT_KEY);
}

function normalizeImages(images: ProductImage[]) {
  return images.map((image, index) => ({
    ...image,
    is_primary: index === 0,
    order: index,
  }));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readBlobAsBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read converted image."));
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

async function convertImageToWebP(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load image."));
      image.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare image conversion.");
    context.drawImage(img, 0, 0);
    const webpBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("WebP conversion failed."))),
        "image/webp",
        0.9,
      );
    });
    return {
      base64: await readBlobAsBase64(webpBlob),
      mimeType: "image/webp",
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState<ProductDraft | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetchAdminProducts(),
  });

  const { data: adminContext } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminDashboard(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchAdminCategories(),
  });

  useEffect(() => {
    setDraft(loadProductDraft());
  }, []);

  useEffect(() => {
    if (!editing || editing.id) return;
    const hasMeaningfulDraft =
      editing.name.trim() ||
      editing.brand.trim() ||
      editing.sku.trim() ||
      editing.short_description.trim() ||
      editing.description.trim() ||
      editing.images.length > 0 ||
      editing.tags.length > 0;
    if (!hasMeaningfulDraft) return;

    const timeout = window.setTimeout(() => {
      saveProductDraft(editing);
      setDraft(loadProductDraft());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [editing]);

  function openNew() {
    const savedDraft = loadProductDraft();
    if (savedDraft) {
      setEditing(savedDraft.form);
      setDraft(savedDraft);
      toast.info("Restored your unsaved product draft.");
    } else {
      setEditing({ ...empty, images: [], tags: [] });
    }
    setOpen(true);
  }

  function restoreDraft() {
    const savedDraft = loadProductDraft();
    if (!savedDraft) {
      setDraft(null);
      return;
    }
    setEditing(savedDraft.form);
    setDraft(savedDraft);
    setOpen(true);
    toast.info("Product draft restored.");
  }

  function discardDraft() {
    clearProductDraft();
    setDraft(null);
    if (editing && !editing.id) {
      setEditing({ ...empty, images: [], tags: [] });
    }
    toast.success("Product draft discarded.");
  }

  function openEdit(p: ProductRow) {
    setEditing({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand ?? "",
      sku: p.sku ?? "",
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      price: p.price,
      compare_at_price: p.compare_at_price,
      stock: p.stock,
      category_slug: p.category_slug ?? "",
      caliber: p.caliber ?? "",
      power_plant: p.power_plant ?? "",
      velocity: p.velocity ?? "",
      is_featured: p.is_featured,
      is_active: p.is_active,
      licence_required: p.licence_required,
      track_inventory: p.track_inventory,
      requiresHandling: p.requiresHandling,
      requiresPremiumProtection: p.requiresPremiumProtection,
      visibility_priority: p.visibility_priority,
      images: normalizeImages(p.images ?? []),
      tags: p.tags ?? [],
    });
    setOpen(true);
  }

  async function handleFiles(files: FileList | null) {
    if (!editing || !files?.length) return;
    const productName = editing.name.trim();
    if (!productName) {
      toast.error("Enter product name before uploading images.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Converting images to WebP and uploading to ImageKit...");
    try {
      const uploaded: ProductImage[] = [];
      const startingCount = editing.images.length;
      for (const [index, file] of Array.from(files).entries()) {
        const converted = await convertImageToWebP(file);
        const image = await uploadProductImage({
          filename: file.name,
          mimeType: converted.mimeType,
          base64: converted.base64,
          productName,
          productSlug: editing.slug || slugify(productName),
          imageIndex: startingCount + index + 1,
        });
        uploaded.push(image);
      }

      setEditing((current) =>
        current
          ? {
              ...current,
              images: normalizeImages([...current.images, ...uploaded]),
            }
          : current,
      );
      toast.success("Uploaded to ImageKit", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload images", {
        id: toastId,
      });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!editing) return;
    try {
      await saveAdminProduct({
        ...editing,
        slug: editing.slug || slugify(editing.name),
        images: normalizeImages(editing.images),
        seo: {
          meta_title: editing.name,
          meta_description: editing.short_description,
          meta_keywords: editing.tags,
        },
      });
      toast.success("Saved");
      clearProductDraft();
      setDraft(null);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteAdminProduct(id);
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete product");
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-display text-3xl">Products</h1>
        <Button onClick={openNew} className="btn-tactical-glow">
          <Plus className="w-4 h-4 mr-1" /> New product
        </Button>
      </div>

      {draft && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold text-primary">Unsaved product draft found</div>
            <div className="text-muted-foreground">
              {draft.form.name || "New product"} • saved{" "}
              {new Date(draft.savedAt).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={restoreDraft}>
              Restore
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={discardDraft}>
              Discard
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Brand</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="p-3">Images</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.brand}</td>
                <td className="p-3 text-right">₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td className="p-3 text-right">{p.stock}</td>
                <td className="p-3 text-center">{p.images?.length ?? 0}</td>
                <td className="p-3 text-center">{p.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-primary">
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  {adminContext?.permissions.canDeleteProducts && (
                    <button onClick={() => del(p.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No products yet. Add the first TacticalTune product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && uploading) {
            toast.error("Image upload is still running. Please wait before closing.");
            return;
          }
          setOpen(nextOpen);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Add"} product popup</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditing({
                        ...editing,
                        name,
                        slug: editing.slug || slugify(name),
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={editing.brand}
                    onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={editing.sku}
                    onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full border border-input rounded px-3 py-2 bg-background"
                    value={editing.category_slug}
                    onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}
                  >
                    <option value="">—</option>
                    {categories.map((c: CategoryRow) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Visibility priority</Label>
                  <Input
                    type="number"
                    value={editing.visibility_priority}
                    onChange={(e) =>
                      setEditing({ ...editing, visibility_priority: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Price ₹</Label>
                  <Input
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Compare-at price ₹</Label>
                  <Input
                    type="number"
                    value={editing.compare_at_price ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        compare_at_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Caliber</Label>
                  <Input
                    value={editing.caliber}
                    onChange={(e) => setEditing({ ...editing, caliber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Power plant</Label>
                  <Input
                    value={editing.power_plant}
                    onChange={(e) => setEditing({ ...editing, power_plant: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Velocity</Label>
                  <Input
                    value={editing.velocity}
                    onChange={(e) => setEditing({ ...editing, velocity: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Tags, comma separated</Label>
                <Input
                  value={editing.tags.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div>
                <Label>Short description</Label>
                <Textarea
                  value={editing.short_description}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={5}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <Label>Product images</Label>
                    <p className="text-xs text-muted-foreground">
                      Images are converted to WebP in the browser, then uploaded to ImageKit:
                      /Tactical-Tune/Products/{slugify(editing.slug || editing.name)}
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
                    <ImagePlus className="h-4 w-4" />
                    Upload images
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      className="hidden"
                      onChange={async (e) => {
                        await handleFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {editing.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {editing.images.map((image, index) => (
                      <div key={`${image.url}-${index}`} className="relative overflow-hidden rounded border border-border bg-muted">
                        <img
                          src={image.thumbnailUrl || image.url}
                          alt={image.alt || editing.name}
                          className="aspect-square h-full w-full object-cover"
                        />
                        <div className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-xs">
                          {index === 0 ? "Primary" : `#${index + 1}`}
                        </div>
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded bg-destructive p-1 text-destructive-foreground"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              images: normalizeImages(
                                editing.images.filter((_, imageIndex) => imageIndex !== index),
                              ),
                            })
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No images uploaded yet.
                  </div>
                )}
              </div>

              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={editing.is_active}
                    onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                  />{" "}
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={editing.is_featured}
                    onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })}
                  />{" "}
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={editing.licence_required}
                    onCheckedChange={(v) => setEditing({ ...editing, licence_required: v })}
                  />{" "}
                  Licence required
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={editing.track_inventory}
                    onCheckedChange={(v) => setEditing({ ...editing, track_inventory: v })}
                  />{" "}
                  Track inventory
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={editing.requiresHandling}
                    onCheckedChange={(v) => setEditing({ ...editing, requiresHandling: v })}
                  />{" "}
                  Requires handling
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={editing.requiresPremiumProtection}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, requiresPremiumProtection: v })
                    }
                  />{" "}
                  Premium protection
                </label>
              </div>

              <Button onClick={save} disabled={uploading} className="w-full btn-tactical-glow">
                Save product
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
