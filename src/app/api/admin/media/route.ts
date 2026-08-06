import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const data = await request.formData();
  const file = data.get("file");
  if (
    !(file instanceof File) ||
    file.size > 5 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
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
