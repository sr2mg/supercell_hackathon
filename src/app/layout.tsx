import type { Metadata } from "next";
import { Rammetto_One, Inter } from "next/font/google";
import "./globals.css";

const rammettoOne = Rammetto_One({
  weight: "400",
  variable: "--font-rammetto-one",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Newsopoly",
  description: "A news-based board game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rammettoOne.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
