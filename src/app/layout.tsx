import type { Metadata } from "next";
import { Wix_Madefor_Text, DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";

// Base44 Primary UI Sans-Serif
const wixMadeforText = Wix_Madefor_Text({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Base44 Display / Headline Serif
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
  display: "swap",
});

// Inter font (used for branding/M logo)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirancim Platformu",
  description: "Xususiy repetitorlar uchun boshqaruv tizimi / Özel Ders Yönetim Sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark" suppressHydrationWarning>
      <body
        className={`${wixMadeforText.variable} ${dmSerifDisplay.variable} ${inter.variable} font-sans antialiased transition-colors duration-150`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
