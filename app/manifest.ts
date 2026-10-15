import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swim Forward",
    short_name: "Swim Forward",
    description: "Clear swimming updates and focused coaching.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f5f7f9",
    theme_color: "#142b40",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
