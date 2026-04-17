import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chromatique | AI Fashion Discovery",
  description: "Color-first fashion search MVP with AI-ready image matching and niche brand discovery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
