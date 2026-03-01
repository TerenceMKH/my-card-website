import Link from 'next/link';
import { getSheetData } from '@/lib/google-sheets';

export default async function Navbar() {
  // 1. Fetch site settings to get the dynamic website name
  const settingsData = await getSheetData('Site_Settings');
  const siteNameSetting = settingsData.find((s) => s.Key === 'SiteName');
  const siteName = siteNameSetting?.Value || 'My Website';

  // 2. Fetch the menu items from the Menu_Nav sheet
  const menuData = await getSheetData('Menu_Nav');
  
  // 3. Filter out hidden items and sort them by your manual order
  const navItems = menuData
    .filter((item) => item.Display?.toLowerCase() === 'true')
    .sort((a, b) => {
      const sortA = parseInt(a.Sort_Order) || 0;
      const sortB = parseInt(b.Sort_Order) || 0;
      return sortA - sortB; // Ascending order: 1, 2, 3...
    });

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side: Logo */}
          <Link href="/" className="font-extrabold text-xl text-blue-600 tracking-tight">
            {siteName}
          </Link>

          {/* Right Side: Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.Menu_Title} 
                href={item.URL_Path}
                className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors uppercase tracking-wide"
              >
                {item.Menu_Title}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Icon (Placeholder for smaller screens) */}
          <div className="md:hidden flex items-center">
            <span className="text-gray-500 text-sm">Menu</span>
          </div>

        </div>
      </div>
    </nav>
  );
}