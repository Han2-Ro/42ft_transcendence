import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "../componets/sidebar/NavigationBar";
import { getSession } from "@/lib/auth/session";
import AuthProvider from "@/componets/AuthProvider";
import SidebarActionsProvider from "@/componets/sidebar/SidebarActionsProvider";
import Footer from "./Footer";

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
      <body className={`min-h-screen antialiased flex flex-col lg:flex-row`}>
        <AuthProvider initialUser={user}>
          <SidebarActionsProvider>
            <NavigationBar />
            <div className="w-full h-screen overflow-y-auto flex flex-col flex-1 bg-background-primary">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </SidebarActionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
