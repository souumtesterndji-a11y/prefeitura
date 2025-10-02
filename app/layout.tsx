import type React from "react"
import { Suspense } from "react"
import "./globals.css"
import { AntiInspect } from "@/components/anti-inspect"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AntiInspect />
        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  )
}

export const metadata = {
  generator: "v0.app",
}
