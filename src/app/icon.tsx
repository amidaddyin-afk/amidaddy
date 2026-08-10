import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default async function Icon() {
  const icon = await readFile(
    path.join(process.cwd(), "public", "brand", "amidaddy-icon-64.png"),
  );

  return new Response(new Uint8Array(icon), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType,
    },
  });
}
