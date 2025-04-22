import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FLS POD Ticket App',
  description: 'Created by thangvt21',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
