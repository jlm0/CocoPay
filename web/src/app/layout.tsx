import type { Metadata } from "next";
import { Anton, Bebas_Neue, Black_Ops_One, Space_Mono } from "next/font/google";
import "./globals.css";
import { CursorFollower } from "@/components/CursorFollower";
import { CoconutSpawner } from "@/components/CoconutSpawner";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brutal",
});

const blackOpsOne = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ops",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CocoPay 🥥 | Community Commerce",
  description: "The community commerce payment app. Split bills, send money, group buy, and earn together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${bebasNeue.variable} ${blackOpsOne.variable} ${spaceMono.variable}`}
      >
        <CursorFollower />
        <CoconutSpawner />
        {children}
      </body>
    </html>
  );
}
