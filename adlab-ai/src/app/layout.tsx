import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdLab AI — AI Ad Creative That Actually Converts",
  description:
    "Generate studio-quality ad copy, images, and campaigns in seconds. Art-directed by GPT. Rendered by Google Nano Banana. Optimized by AI.",
  openGraph: {
    title: "AdLab AI — AI Ad Creative That Actually Converts",
    description: "Generate studio-quality ad creative in seconds. GPT art direction + Nano Banana rendering.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
