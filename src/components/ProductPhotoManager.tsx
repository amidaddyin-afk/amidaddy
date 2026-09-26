"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ImageUp, Star, Trash2, X } from "lucide-react";
import type { Product, ProductMedia } from "@/lib/data";
import {
  galleryIndices,
  makeFirstPhoto,
  movePhoto,
  type Gallery,
} from "@/features/catalog/photo-order";
import { prepareProductImage } from "@/features/catalog/prepare-image";

/**
 * The three galleries a photo can belong to. `null` is the shared gallery shown
 * for every size; the other two are size specific. Each list is ordered, and its
 * first photo is the one the storefront leads with for that size.
 */
const GALLERIES = [
  [null, "All sizes", "Product page gallery, whichever size is selected."],
  [
    "20ml",
    "20 ml",
    "Product page and product cards when 20 ml is selected. The first photo leads.",
  ],
  [
    "100ml",
    "100 ml",
    "Product page and product cards when 100 ml is selected. The first photo leads.",
  ],
] as const;

/** Where a photo's file lives, so it can be found and replaced. */
const fileOf = (url: string) =>
  url.startsWith("/") ? `public${url}` : "Uploaded in the admin portal";

/**
 * The details form still posts the whole product, so a photo edit and a details
 * edit must agree on the same list. Falling back to `images` keeps products that
 * predate the media library - including the hardcoded catalog - editable.
 */
export function mediaOf(product: Product): ProductMedia[] {
  if (product.mediaLibrary?.length) return product.mediaLibrary;
  return product.images.map((url) => ({
    url,
    alt: product.name,
    variantName: null,
  }));
}

export default function ProductPhotoManager({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<ProductMedia[]>(() => mediaOf(product));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const indicesOf = (gallery: Gallery) => galleryIndices(photos, gallery);

  const move = (gallery: Gallery, position: number, delta: number) =>
    setPhotos(movePhoto(photos, gallery, position, delta));

  const makeFirst = (gallery: Gallery, position: number) =>
    setPhotos(makeFirstPhoto(photos, gallery, position));

  const remove = (index: number) =>
    setPhotos(photos.filter((_, item) => item !== index));

  const setAlt = (index: number, alt: string) =>
    setPhotos(
      photos.map((photo, item) => (item === index ? { ...photo, alt } : photo)),
    );

  async function upload(file: File, gallery: Gallery) {
    setBusy(true);
    setMessage("Preparing photo…");
    try {
      const data = new FormData();
      data.set("file", await prepareProductImage(file));
      setMessage("Uploading…");
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: data,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.url)
        throw new Error(body.error ?? "Upload failed.");
      setMessage("");
      setPhotos((current) => [
        ...current,
        { url: body.url, alt: product.name, variantName: gallery },
      ]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!photos.length) {
      setMessage("Keep at least one photo.");
      return;
    }
    if (photos.some((photo) => !photo.alt.trim())) {
      setMessage("Every photo needs alt text.");
      return;
    }
    setBusy(true);
    setMessage("Saving…");
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          action: "images",
          product: { images: photos },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Unable to save photos.");
      setMessage("Photos saved.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save photos.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="catalog-editor">
      <button onClick={onClose} aria-label="Close photo manager">
        <X />
      </button>
      <p className="eyebrow">Photos</p>
      <h3 className="display-title mt-3 text-3xl">{product.name}</h3>
      <p className="mt-2 text-sm opacity-70">
        The top photo of each gallery is the one shoppers see first.
      </p>

      {GALLERIES.map(([gallery, label, where]) => {
        const indices = indicesOf(gallery);
        const builtIn = gallery ? (product.variantImages?.[gallery] ?? []) : [];
        return (
          <section key={label} className="mt-6">
            <div className="flex items-center justify-between">
              <strong>{label}</strong>
              <label className="upload-control">
                <ImageUp size={15} />
                Add photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) upload(file, gallery);
                  }}
                />
              </label>
            </div>
            <p className="mt-1 text-xs opacity-60">{where}</p>
            {indices.length === 0 && builtIn.length > 0 ? (
              <>
                <p className="mt-2 text-sm opacity-70">
                  Nothing uploaded yet, so the site shows these built-in photos.
                  Replace a file with one of the same name to change it, or add
                  a photo here to override them all.
                </p>
                <ul className="admin-photo-list mt-3">
                  {builtIn.map((url) => (
                    <li key={url}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" />
                      <code className="admin-photo-file">{fileOf(url)}</code>
                    </li>
                  ))}
                </ul>
              </>
            ) : indices.length === 0 ? (
              <p className="mt-2 text-sm opacity-60">
                No photos yet. This size falls back to the shared gallery.
              </p>
            ) : (
              <ul className="admin-photo-list mt-3">
                {indices.map((index, position) => (
                  <li key={`${photos[index].url}-${index}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[index].url} alt={photos[index].alt} />
                    <div>
                      <input
                        value={photos[index].alt}
                        placeholder="Alt text"
                        onChange={(event) => setAlt(index, event.target.value)}
                      />
                      <code className="admin-photo-file">
                        {fileOf(photos[index].url)}
                      </code>
                      {position === 0 && (
                        <span className="text-champagne text-xs">
                          Shown first
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn-ghost"
                        disabled={position === 0}
                        onClick={() => makeFirst(gallery, position)}
                        aria-label={`Show ${photos[index].alt} first`}
                      >
                        <Star size={13} />
                      </button>
                      <button
                        className="btn-ghost"
                        disabled={position === 0}
                        onClick={() => move(gallery, position, -1)}
                        aria-label={`Move ${photos[index].alt} up`}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        className="btn-ghost"
                        disabled={position === indices.length - 1}
                        onClick={() => move(gallery, position, 1)}
                        aria-label={`Move ${photos[index].alt} down`}
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => remove(index)}
                        aria-label={`Remove ${photos[index].alt}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {message && <p className="text-champagne mt-3 text-sm">{message}</p>}
      <button className="lux-button mt-5" disabled={busy} onClick={save}>
        Save photos
      </button>
    </div>
  );
}
