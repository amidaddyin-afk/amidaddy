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
  if (!(file instanceof File) || !(await isAllowedProductImage(file)))
    return NextResponse.json(
      { error: "Upload a JPG, PNG or WebP up to 5 MB." },
      { status: 400 },
    );
  const supabase = await createClient();
  const path = `products/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()}`;
  const { error } = await supabase.storage
    .from("product-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error)
    return NextResponse.json(
      { error: "Unable to upload product media." },
      { status: 500 },
    );
  const { data: publicUrl } = supabase.storage
    .from("product-media")
    .getPublicUrl(path);
  return NextResponse.json({ url: publicUrl.publicUrl });
}
