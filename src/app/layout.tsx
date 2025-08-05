import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarStateProvider } from "@/contexts/SidebarContext";
import { BlurProvider } from "@/contexts/BlurContext";
import { CollapsibleProvider } from "@/contexts/CollapsibleContext";
import { TabSyncProvider } from "@/contexts/TabSyncContext";
import { GlobalCommandK } from "@/components/global-command-k";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Client Flows Platform",
  description: "Plataforma para gerenciamento de fluxos de clientes",
  icons: {
    icon: "/vercel.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarStateProvider>
          <TabSyncProvider>
            <CollapsibleProvider>
              <BlurProvider>
                {children}
                <GlobalCommandK />
              </BlurProvider>
            </CollapsibleProvider>
          </TabSyncProvider>
        </SidebarStateProvider>
      </body>
    </html>
  );
}
