import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getThemeConfig } from "@/lib/theme";
import { getSheetData } from "@/lib/google-sheets";

const inter = Inter({ subsets: ["latin"] });

export const revalidate = 60;

// Global Default SEO (Applies if a page doesn't have specific metadata)
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSheetData('Site_Settings');
  const getSetting = (key: string, fallback: string) => settings.find(s => s.Key === key)?.Value || fallback;

  const siteName = getSetting('SiteName', 'HK Card Hub');
  const description = getSetting('HomeHeroSubtitle', 'Find the perfect credit card.');

  return {
    title: siteName,
    description: description,
    openGraph: {
      title: siteName,
      description: description,
      siteName: siteName,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { getTheme } = await getThemeConfig();
  const globalBg = getTheme('Global', 'Entire_Site', 'Background', 'Background_Color', '#f8fafc');
  const globalText = getTheme('Global', 'Entire_Site', 'Text', 'Text_Color', '#0f172a');

  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: globalBg, color: globalText }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}