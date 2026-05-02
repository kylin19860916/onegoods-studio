import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OneGoods Studio · 玩物工坊",
    template: "%s · OneGoods Studio",
  },
  description:
    "OneGoods Studio · 玩物工坊 — 由数码科技博主延伸的产品母品牌。Maker 实践 + 工业美学 + 可玩好物。",
  metadataBase: new URL("https://onegoods.studio"),
  openGraph: {
    title: "OneGoods Studio · 玩物工坊",
    description: "Maker 实践 + 工业美学 + 可玩好物",
    type: "website",
    locale: "zh_CN",
    siteName: "OneGoods Studio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

