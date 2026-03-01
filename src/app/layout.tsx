import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import your new Navbar component
import Navbar from "@/components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

// This sets the default title tag for SEO
export const metadata: Metadata = {
  title: "HK Card Hub",
  description: "Find the perfect credit card for your lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* The Navbar will now appear at the top of EVERY page */}
        <Navbar />
        
        {/* 'children' represents whatever page the user is currently looking at */}
        {children}
      </body>
    </html>
  );
}