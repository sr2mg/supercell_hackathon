import type { Metadata } from "next";
import { Rammetto_One, Inter, Bebas_Neue, Lilita_One, Playfair_Display } from "next/font/google";
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

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const lilitaOne = Lilita_One({
  weight: "400",
  variable: "--font-lilita-one",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STOP the PRESSES!",
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
        className={`${rammettoOne.variable} ${inter.variable} ${bebasNeue.variable} ${lilitaOne.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
