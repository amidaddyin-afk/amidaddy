const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Keep browser uploads below the serverless request limit, including form data. */
export async function prepareProductImage(file: File): Promise<File> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new Error("Choose a JPG, PNG or WebP photo.");
  if (file.size > MAX_SOURCE_BYTES)
    throw new Error("Choose a photo smaller than 20 MB.");
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This photo could not be opened. Try a JPG or PNG copy.");
  }
  try {
    let scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    for (const quality of [0.82, 0.7, 0.58]) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to prepare this photo.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (!blob || blob.type !== "image/webp")
        throw new Error("This browser cannot prepare the photo as WebP.");
      if (blob.size <= MAX_UPLOAD_BYTES)
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
          type: "image/webp",
        });
      scale *= 0.75;
    }
    throw new Error("This photo is too large to upload. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}
