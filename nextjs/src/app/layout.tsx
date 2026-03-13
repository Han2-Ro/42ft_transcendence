import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "../componets/NavigationBar";
import { getSession } from "@/lib/auth/session";
import AuthProvider from "@/componets/AuthProvider";
import SidebarActionsProvider from "@/componets/SidebarActionsProvider";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen antialiased lg:flex lg:flex-row bg-background-primary`}
      >
        <AuthProvider initialUser={user}>
          <SidebarActionsProvider>
            <NavigationBar />
            <div>{children}</div>
          </SidebarActionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
