"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Images, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/data";
import { formatInr } from "@/lib/money";
import ProductPhotoManager, { mediaOf } from "@/components/ProductPhotoManager";
import { catalogCardImage } from "@/features/catalog/photo-order";
import { prepareProductImage } from "@/features/catalog/prepare-image";

const split = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
export default function CatalogManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [replacedImages, setReplacedImages] = useState<Record<string, string>>(
    {},
  );
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
      // Photos are managed in their own editor, so a details save must hand
      // back the galleries untouched rather than flatten them onto one size.
      images: editing
        ? mediaOf(editing)
        : [
            {
              url: uploadedUrl,
              alt: String(data.get("name")),
              variantName: editingComboSize,
            },
          ],
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
    try {
      const data = new FormData();
      data.set("file", await prepareProductImage(file));
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: data,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.url)
        throw new Error(body.error ?? "Upload failed.");
      setUploadedUrl(body.url);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  async function replaceCatalogImage(product: Product, file: File) {
    setReplacingId(product.id);
    setMessage(`Uploading ${product.name} image…`);
    try {
      const data = new FormData();
      data.set("file", await prepareProductImage(file));
      const uploadResponse = await fetch("/api/admin/media", {
        method: "POST",
        body: data,
      });
      const uploaded = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok || !uploaded.url)
        throw new Error(uploaded.error ?? "Upload failed.");
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          action: "catalog-image",
          product: { url: uploaded.url, alt: product.name },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(body.error ?? "Unable to update catalogue image.");
      setReplacedImages((current) => ({
        ...current,
        [product.id]: uploaded.url,
      }));
      setMessage(`${product.name} catalogue image updated.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setReplacingId(null);
    }
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="admin-product-cover"
              src={
                replacedImages[product.id] ??
                catalogCardImage(
                  product,
                  product.variants.find((variant) => variant.name === "100ml")
                    ? "100ml"
                    : "20ml",
                )
              }
              alt={`${product.name} catalogue image`}
            />
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
              <label className="btn-ghost admin-cover-upload">
                <ImageUp size={13} />
                {replacingId === product.id ? "Uploading…" : "Replace image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={replacingId !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void replaceCatalogImage(product, file);
                  }}
                />
              </label>
              <button
                className="btn-ghost"
                onClick={() => {
                  setEditing(product);
                  setCreating(false);
                  setPhotoTarget(null);
                }}
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setPhotoTarget(product);
                  setEditing(null);
                  setCreating(false);
                }}
              >
                <Images size={13} /> Photos
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
          setPhotoTarget(null);
        }}
      >
        <Plus size={14} /> New fragrance
      </button>
      {message && <p className="text-champagne mt-3 text-sm">{message}</p>}
      {photoTarget && (
        <ProductPhotoManager
          key={photoTarget.id}
          product={photoTarget}
          onClose={() => setPhotoTarget(null)}
        />
      )}
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
            {editing ? (
              <p className="text-sm opacity-70">
                Photos are managed in the Photos editor for this fragrance.
              </p>
            ) : (
              <>
                <input
                  name="images"
                  placeholder="First photo URL"
                  value={uploadedUrl}
                  onChange={(event) => setUploadedUrl(event.target.value)}
                  required
                />
                <label className="upload-control">
                  <ImageUp size={15} />
                  {uploading ? "Uploading…" : "Upload first photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={(event) =>
                      event.target.files?.[0] && upload(event.target.files[0])
                    }
                  />
                </label>
              </>
            )}
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
