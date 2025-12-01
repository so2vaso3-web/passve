import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
    short_name: "Pass Vé Phim",
    description: "Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

