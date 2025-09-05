import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = "https://jiniai.vercel.app";
    const today = new Date().toISOString().split("T")[0];

    // List of pages to include in sitemap
    const pages = [
      { url: "/", priority: 1.0 },
      { url: "/login", priority: 0.8 },
      { url: "/registration", priority: 0.8 },
      { url: "/downloads/app.apk", priority: 0.9 }, // APK download page
      // add more pages here if needed
    ];

    // Generate XML for all pages
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;

    return new Response(sitemap.trim(), {
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
