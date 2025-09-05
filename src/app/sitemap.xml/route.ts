import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
  const baseUrl = "https://jiniai.vercel.app";

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}/</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseUrl}/login</loc>
      <priority>0.8</priority>
    </url>
    <url>
      <loc>${baseUrl}/registration</loc>
      <priority>0.8</priority>
    </url>
  </urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });

  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
