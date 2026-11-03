import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "fika",
    short_name: "fika",
    description: "A coffee shop rating app.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#f6f4ef",
    icons: [
      {
        src: "/cardamomBun.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
