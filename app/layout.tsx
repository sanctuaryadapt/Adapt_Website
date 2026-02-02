import type { Metadata } from 'next'
import { Comfortaa } from 'next/font/google'
import './globals.css'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  DEFAULT_OG_IMAGE,
  generateOrganizationSchema
} from '@/lib/seo'

const comfortaa = Comfortaa({ subsets: ['latin'] })

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: `${SITE_NAME} - Advanced Autonomous Service Robots`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // Favicon and icons
  icons: {
    icon: '/assets/pics/AdaptLogo.png',
    apple: '/assets/pics/AdaptLogo.png',
  },

  // Canonical URL
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },

  // Open Graph metadata (for LinkedIn, Facebook, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Advanced Autonomous Service Robots`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Autonomous Service Robots`,
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Advanced Autonomous Service Robots`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: '@AdaptRobotics', // Update with actual Twitter handle
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Additional metadata
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body className={comfortaa.className}>{children}</body>
    </html>
  )
}
