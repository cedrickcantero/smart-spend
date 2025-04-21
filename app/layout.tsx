import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/app/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { NetworkStatusProvider } from "@/lib/network-status-context"
import { NetworkStatusIndicator } from "@/components/network-status-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
import { UserSettingsProvider } from "@/app/contexts/UserSettingsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track and manage your expenses with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <UserSettingsProvider>
              <NetworkStatusProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                  storageKey="smart-spend-theme"
                >
                  {children}
                  <NetworkStatusIndicator />
                  <Toaster position="top-center" richColors />
                </ThemeProvider>
              </NetworkStatusProvider>
            </UserSettingsProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}