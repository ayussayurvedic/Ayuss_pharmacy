import type { Metadata, Viewport } from 'next';
import { Inter, Lexend } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import PWAStandaloneGuard from '@/components/pwa/PWAStandaloneGuard';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import PushPermissionPrompt from '@/components/pwa/PushPermissionPrompt';
import { ToastProvider } from '@/components/ui/Toast';
import SchemaMarkup from '@/components/layout/SchemaMarkup';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
  preload: true,
});


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sspharmacy.com'),
  alternates: {
    canonical: 'https://sspharmacy.com',
  },
  title: {
    default: 'AYU S.S. PHARMACY - Authentic Ayurvedic Quality',
    template: '%s | S.S. Pharmacy',
  },
  description:
    'S.S. PHARMACY official online presence. Premium government-licensed Ayurvedic manufacturer located in Yerraguntla, Kadapa District, Andhra Pradesh.',
  keywords: [
    'Ayurveda',
    'S.S. Pharmacy',
    'Ayurvedic manufacturer',
    'Yerraguntla',
    'Kadapa District',
    'Andhra Pradesh',
    'Ayurvedic medicine',
    'Pain relief cream',
    'Authentic Ayurvedic Quality',
  ],
  authors: [{ name: 'S.S. Pharmacy' }],
  creator: 'S.S. Pharmacy',
  publisher: 'S.S. Pharmacy',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'S.S. Pharmacy Portal',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sspharmacy.com',
    siteName: 'S.S. Pharmacy',
    title: 'AYU S.S. PHARMACY - Authentic Ayurvedic Quality',
    description: 'S.S. Pharmacy official online presence. Premium government-licensed Ayurvedic manufacturer located in Yerraguntla, Kadapa District, Andhra Pradesh.',
    images: [
      {
        url: '/products/logo/logo.webp',
        width: 1200,
        height: 630,
        alt: 'S.S. Pharmacy — Authentic Ayurvedic Quality',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AYU S.S. PHARMACY - Authentic Ayurvedic Quality',
    description: 'S.S. Pharmacy official online presence. Premium government-licensed Ayurvedic manufacturer located in Yerraguntla, Kadapa District, Andhra Pradesh.',
    images: ['/products/logo/logo.webp'],
  },
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'eMOo4ExCO99sPtGufiKsizz5pJcV-8wzTo3BypIuPBE',
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://sspharmacy.com/#organization",
  "name": "S.S. Pharmacy",
  "url": "https://sspharmacy.com",
  "logo": "https://sspharmacy.com/products/logo/logo.webp",
  "image": "https://sspharmacy.com/products/logo/logo.webp",
  "sameAs": [
    "https://www.linkedin.com/company/ss-pharmacy",
    "https://twitter.com/ss_pharmacy"
  ],
  "telephone": "+919494323211",
  "priceRange": "$$",
  "knowsAbout": ["Ayurveda", "Ayurvedic proprietary medicine", "Pain relief cream"],
  "license": "R-1970/Ayur",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "D. No. 1-2-211 & 1-2-212, Prakash Nagar, Yerraguntla Panchayati",
    "addressLocality": "YSR Kadapa District",
    "addressRegion": "Andhra Pradesh",
    "postalCode": "516309",
    "addressCountry": "IN"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-1NL15P2C1V';
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  return (
    <html lang="en" className={`min-h-screen antialiased overflow-x-hidden ${inter.variable} ${lexend.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden w-full">

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${clarityId}");
            `}
          </Script>
        )}

        <SchemaMarkup schema={orgSchema} />
        <ToastProvider>
          {children}
          <PWAStandaloneGuard />
          <PWAInstallPrompt />
          <PushPermissionPrompt />
        </ToastProvider>
      </body>
    </html>
  );
}


