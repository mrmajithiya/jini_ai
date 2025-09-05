export async function GET() {
  try {
    const baseUrl = "https://jiniai.vercel.app";

        const routes = [
      '/',
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${routes
        .map(
          route => `
        <url>
          <loc>${baseUrl}${route}</loc>
          <changefreq>monthly</changefreq>
          <priority>${route === '/' ? '0.7' : '0.1'}</priority>
        </url>`
        )
        .join('')}
    </urlset>`;


   return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
