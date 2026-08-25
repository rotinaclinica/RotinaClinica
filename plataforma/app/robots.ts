import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/setup/", "/sair/"],
      },
    ],
    sitemap: "https://www.rotinaclinica.com/sitemap.xml",
  };
}
