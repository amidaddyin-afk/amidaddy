"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/data";
import { formatInr } from "@/lib/money";

const split = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
export default function CatalogManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving…");
    const data = new FormData(event.currentTarget);
    const editingComboSize =
      editing?.collection === "combos" ? editing.variants[0]?.name : null;
    const product = {
      name: data.get("name"),
      slug: data.get("slug"),
      sku: data.get("sku"),
      barcode: null,
      description: data.get("description"),
      gstRate: 18,
      fragranceFamily: data.get("family"),
      concentration: "Eau de Parfum",
      genderPositioning: "Unisex",
      collection: editing?.collection ?? "unisex",
      packSize: editing?.packSize ?? 1,
      topNotes: split(data.get("topNotes")),
      heartNotes: split(data.get("heartNotes")),
      baseNotes: split(data.get("baseNotes")),
      longevity: data.get("longevity"),
      mood: data.get("mood"),
      occasion: data.get("occasion"),
      story: data.get("story"),
      active: true,
      featured: data.get("featured") === "on",
      isNew: data.get("isNew") === "on",
      bestSeller: data.get("bestSeller") === "on",
      seoTitle: data.get("seoTitle") || null,
      seoDescription: data.get("seoDescription") || null,
      brandId: null,
      categoryId: null,
      images: split(data.get("images")).map((url) => ({
        url,
        alt: String(data.get("name")),
        variantName: editingComboSize,
      })),
      variants: [
        {
          id: editing?.variants.find((item) => item.name === "20ml")?.id,
          name: "20ml",
          sku: data.get("sku20"),
          pricePaise: Math.round(Number(data.get("price20")) * 100),
          mrpPaise: Math.round(Number(data.get("mrp20")) * 100),
          stock: Number(data.get("stock20")),
          lowStockAt: 5,
          active: true,
        },
        {
          id: editing?.variants.find((item) => item.name === "100ml")?.id,
          name: "100ml",
          sku: data.get("sku100"),
          pricePaise: Math.round(Number(data.get("price100")) * 100),
          mrpPaise: Math.round(Number(data.get("mrp100")) * 100),
          stock: Number(data.get("stock100")),
          lowStockAt: 5,
          active: true,
        },
      ].filter((item) => !editingComboSize || item.name === editingComboSize),
    };
    const response = await fetch("/api/admin/products", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editing ? { id: editing.id, action: "update", product } : product,
      ),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.error ?? "Unable to save product.");
      return;
    }
    setMessage("Product saved.");
    setEditing(null);
    setCreating(false);
    router.refresh();
  }
  async function archive(product: Product) {
    if (!window.confirm(`Archive ${product.name}?`)) return;
    const response = await fetch(
      `/api/admin/products?id=${encodeURIComponent(product.id)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setMessage("Unable to archive product.");
      return;
    }
    setMessage("Product archived.");
    router.refresh();
  }
  async function upload(file: File) {
    setUploading(true);
    const data = new FormData();
    data.set("file", file);
    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: data,
    });
    const body = await response.json();
    setUploading(false);
    if (response.ok) setUploadedUrl(body.url);
    else setMessage(body.error ?? "Upload failed.");
  }
  const selected = editing;
  const comboSize =
    selected?.collection === "combos" ? selected.variants[0]?.name : null;
  const variant = (name: "20ml" | "100ml") =>
    selected?.variants.find((item) => item.name === name);
  return (
    <div>
      <div className="admin-product-grid">
        {products.map((product) => (
          <article key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <span>
                {product.profile} · {product.active ? "Live" : "Draft"}
              </span>
              <p>
                {product.variants
                  .map((item) => `${item.name} ${formatInr(item.pricePaise)}`)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-ghost"
                onClick={() => {
                  setEditing(product);
                  setCreating(false);
                }}
              >
                <Pencil size={13} /> Edit
              </button>
              {/^[0-9a-f-]{36}$/i.test(product.id) && (
                <button
                  className="btn-ghost"
                  onClick={() => archive(product)}
                  aria-label={`Archive ${product.name}`}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <button
        className="lux-button mt-5"
        onClick={() => {
          setCreating(true);
          setEditing(null);
        }}
      >
        <Plus size={14} /> New fragrance
      </button>
      {message && <p className="text-champagne mt-3 text-sm">{message}</p>}
      {(creating || editing) && (
        <div className="catalog-editor">
          <button
            onClick={() => {
              setCreating(false);
              setEditing(null);
            }}
            aria-label="Close editor"
          >
            <X />
          </button>
          <p className="eyebrow">
            {editing ? "Edit fragrance" : "New fragrance"}
          </p>
          <h3 className="display-title mt-3 text-3xl">Catalog details</h3>
          <form onSubmit={save} className="settings-form admin-form mt-5">
            <input
              name="name"
              placeholder="Name"
              defaultValue={selected?.name}
              required
            />
            <input
              name="slug"
              placeholder="slug"
              defaultValue={selected?.slug}
              required
            />
            <input
              name="sku"
              placeholder="Base SKU"
              defaultValue={
                selected ? `AMI-${selected.slug.toUpperCase()}` : ""
              }
              required
            />
            <select name="family" defaultValue={selected?.profile ?? "Woody"}>
              {["Woody", "Fresh", "Floral", "Amber", "Mixed"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <textarea
              name="description"
              placeholder="Product description"
              defaultValue={selected?.description}
              required
            />
            <textarea
              name="story"
              placeholder="Editorial story"
              defaultValue={selected?.story}
              required
            />
            <input
              name="topNotes"
              placeholder="Top notes, comma separated"
              defaultValue={selected?.topNotes.join(", ")}
              required
            />
            <input
              name="heartNotes"
              placeholder="Heart notes, comma separated"
              defaultValue={selected?.heartNotes.join(", ")}
              required
            />
            <input
              name="baseNotes"
              placeholder="Base notes, comma separated"
              defaultValue={selected?.baseNotes.join(", ")}
              required
            />
            <input
              name="longevity"
              placeholder="Longevity"
              defaultValue={selected?.longevity}
              required
            />
            <input
              name="mood"
              placeholder="Mood"
              defaultValue={selected?.mood}
              required
            />
            <input
              name="occasion"
              placeholder="Occasion"
              defaultValue={selected?.occasion}
              required
            />
            <input
              name="images"
              placeholder="Image URLs, comma separated"
              defaultValue={uploadedUrl || selected?.images.join(", ")}
              required
            />
            <label className="upload-control">
              <ImageUp size={15} />
              {uploading ? "Uploading…" : "Upload product image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(event) =>
                  event.target.files?.[0] && upload(event.target.files[0])
                }
              />
            </label>
            <input
              name="sku20"
              placeholder="20 ml SKU"
              defaultValue={variant("20ml")?.sku}
              required={!comboSize || comboSize === "20ml"}
              disabled={comboSize === "100ml"}
            />
            <input
              name="price20"
              type="number"
              min="0"
              step=".01"
              placeholder="20 ml price ₹"
              defaultValue={(variant("20ml")?.pricePaise ?? 19900) / 100}
              required={!comboSize || comboSize === "20ml"}
              disabled={comboSize === "100ml"}
            />
            <input
              name="mrp20"
              type="number"
              min="0"
              step=".01"
              placeholder="20 ml MRP ₹"
              defaultValue={(variant("20ml")?.mrpPaise ?? 24900) / 100}
              required={!comboSize || comboSize === "20ml"}
              disabled={comboSize === "100ml"}
            />
            <input
              name="stock20"
              type="number"
              min="0"
              placeholder="20 ml stock"
              defaultValue={variant("20ml")?.stock ?? 0}
              required={!comboSize || comboSize === "20ml"}
              disabled={comboSize === "100ml"}
            />
            <input
              name="sku100"
              placeholder="100 ml SKU"
              defaultValue={variant("100ml")?.sku}
              required={!comboSize || comboSize === "100ml"}
              disabled={comboSize === "20ml"}
            />
            <input
              name="price100"
              type="number"
              min="0"
              step=".01"
              placeholder="100 ml price ₹"
              defaultValue={(variant("100ml")?.pricePaise ?? 119900) / 100}
              required={!comboSize || comboSize === "100ml"}
              disabled={comboSize === "20ml"}
            />
            <input
              name="mrp100"
              type="number"
              min="0"
              step=".01"
              placeholder="100 ml MRP ₹"
              defaultValue={(variant("100ml")?.mrpPaise ?? 149900) / 100}
              required={!comboSize || comboSize === "100ml"}
              disabled={comboSize === "20ml"}
            />
            <input
              name="stock100"
              type="number"
              min="0"
              placeholder="100 ml stock"
              defaultValue={variant("100ml")?.stock ?? 0}
              required={!comboSize || comboSize === "100ml"}
              disabled={comboSize === "20ml"}
            />
            <input name="seoTitle" placeholder="SEO title" />
            <input name="seoDescription" placeholder="SEO description" />
            <label>
              <input
                type="checkbox"
                name="featured"
                defaultChecked={selected?.featured}
              />{" "}
              Featured
            </label>
            <label>
              <input
                type="checkbox"
                name="isNew"
                defaultChecked={selected?.isNew}
              />{" "}
              New
            </label>
            <label>
              <input
                type="checkbox"
                name="bestSeller"
                defaultChecked={selected?.badge === "Bestseller"}
              />{" "}
              Bestseller
            </label>
            <button className="lux-button">Save fragrance</button>
          </form>
        </div>
      )}
    </div>
  );
}
