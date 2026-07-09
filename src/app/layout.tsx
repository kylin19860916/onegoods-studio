import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";

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

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OneGoods Studio · 解压 3D 打印小物",
    template: "%s · OneGoods Studio",
  },
  description:
    "OneGoods Studio 挑选、打印并测试可爱、有触感、适合日常把玩的 3D 打印解压小物。",
  metadataBase: new URL("https://onegoods.studio"),
  openGraph: {
    title: "OneGoods Studio · 解压 3D 打印小物",
    description: "3D printed stress-relief goods for tiny daily moods.",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
