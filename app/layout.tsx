import { Geist, Geist_Mono } from "next/font/google"

import { AuthSessionProvider } from "@/components/auth/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

import "./globals.css"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=${JSON.stringify("whitelabel.sidebar.collapsed")};var ls=localStorage.getItem(k);if(ls===null)return;var has=document.cookie.split("; ").some(function(c){return c.indexOf(k+"=")===0});if(has)return;document.cookie=k+"="+ls+"; path=/; max-age=31536000; SameSite=Lax";if(ls==="true"&&sessionStorage.getItem("wl-sidebar-ck")!=="1"){sessionStorage.setItem("wl-sidebar-ck","1");location.reload()}}catch(e){}})();`,
          }}
        />
        <AuthSessionProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
