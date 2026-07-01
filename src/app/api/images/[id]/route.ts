import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { readImage } = await import("@/server/admin.server");
  const image = await readImage(id);
  if (!image) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      "content-type": image.contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
