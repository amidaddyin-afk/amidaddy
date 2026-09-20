import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { takeRequestLimit } from "@/lib/request-rate-limit";
import { isAllowedProductImage } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (!(await takeRequestLimit("admin-media", 20, 10 * 60)))
    return NextResponse.json({ error: "Too many uploads." }, { status: 429 });
  const data = await request.formData();
  const file = data.get("file");
  if (file instanceof File && file.size > 3 * 1024 * 1024)
    return NextResponse.json(
      {
        error:
          "Photo is too large. Choose a smaller file or use the admin uploader to resize it.",
      },
      { status: 413 },
    );
  if (!(file instanceof File) || !(await isAllowedProductImage(file)))
    return NextResponse.json(
      { error: "Upload a JPG, PNG or WebP photo." },
      { status: 400 },
    );
  const supabase = await createClient();
  const path = `products/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()}`;
  const { error } = await supabase.storage
    .from("product-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("[admin-media] Storage upload failed:", error);
    const message = /bucket not found/i.test(error.message)
      ? "Product media storage is not configured. Create the product-media bucket in Supabase."
      : /row.level security|permission|unauthorized|not authorized/i.test(
            error.message,
          )
        ? "Storage denied this upload. Check the admin product-media storage policy."
        : `Unable to upload product media: ${error.message}`;
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const { data: publicUrl } = supabase.storage
    .from("product-media")
    .getPublicUrl(path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}
