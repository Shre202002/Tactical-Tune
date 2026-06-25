import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/images/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { readImage } = await import("@/server/admin.server");
        const image = await readImage(params.id);
        if (!image) return new Response("Image not found", { status: 404 });

        return new Response(new Uint8Array(image.bytes), {
          headers: {
            "content-type": image.contentType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
