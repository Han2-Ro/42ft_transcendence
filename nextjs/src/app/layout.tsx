import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../componets/footer";
import Header from "../componets/header";
import MainNavigation from "../componets/main-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess 42",
  description: "Better than chess.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen antialiased flex flex-row bg-background-primary`}
      >
        <div className="bg-background-secondary"><MainNavigation /></div>
        <hr className=" border-zinc-700" />
        {children}
        <hr className=" border-zinc-700" />
        <Footer />
      </body>
    </html>
  );
}
