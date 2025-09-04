// src/app/sitemap.xml/route.ts

export async function GET() {
  const baseUrl = "https://jiniai.vercel.app";

  const staticPages = [
    { url: "", priority: 1.0 }, // homepage only
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}/${page.url}</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
