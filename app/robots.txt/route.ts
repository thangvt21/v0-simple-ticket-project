import { NextResponse } from "next/server"

export function GET() {
  return new NextResponse(
    `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml
`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    },
  )
}
