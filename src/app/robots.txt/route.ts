export function GET() {
  const body = `
User-agent: *
Allow: /

Sitemap: https://jiniai.vercel.app/sitemap.xml
`;

  return new Response(body.trim(), {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
