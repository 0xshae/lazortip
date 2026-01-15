import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Lazorkit Tip Jar - Gasless Crypto Donations',
  description: 'Accept SOL tips without wallet popups. One tap → FaceID → Done.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="polyfills" strategy="beforeInteractive">
          {`
            // Setup global for Node.js compatibility
            (function() {
              if (typeof globalThis !== 'undefined') {
                globalThis.global = globalThis;
              }
              if (typeof window !== 'undefined') {
                window.global = window;
                
                // Ensure crypto is available on global
                if (typeof window.crypto !== 'undefined') {
                  window.global.crypto = window.crypto;
                }
              }
            })();
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
