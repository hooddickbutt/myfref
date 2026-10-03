import type { Metadata } from "next";
import { Geist_Mono, Hind_Siliguri, Syne } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const body = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const display = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "HALO — প্রাইজ কার্ড",
    template: "%s — HALO",
  },
  description:
    "পাম্পফান মিম টোকেনের হোল্ডার কার্ড। এক্স আইডি দিয়ে জয়েন করো, প্রোফাইল ছবি কার্ডে বসবে, হোল্ড ও রেফারে স্পার্ক, জ্যাকপটে পুরস্কার।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${body.variable} ${display.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="grain" aria-hidden="true" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
