import Link from 'next/link';
import { getSheetData } from '@/lib/google-sheets';

export default async function Navbar() {
  const settingsData = await getSheetData('Site_Settings');
  const siteNameSetting = settingsData.find((s) => s.Key === 'SiteName');
  const siteName = siteNameSetting?.Value || 'HK Card Hub';

  const menuData = await getSheetData('Menu_Nav');
  
  const visibleItems = menuData
    .filter((item) => item.Display?.toLowerCase() === 'true')
    .sort((a, b) => (parseInt(a.Sort_Order) || 0) - (parseInt(b.Sort_Order) || 0));

  const topLevelItems = visibleItems.filter(item => !item.Parent_Menu || item.Parent_Menu.trim() === '');
  const moreDropdownItems = visibleItems.filter(item => item.Parent_Menu?.trim() === '更多');

  return (
    <nav className="bg-[#0f172a] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 左側：Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-extrabold text-xl tracking-tight text-white hover:text-blue-300 transition-colors">
              {siteName}
            </Link>
          </div>

          {/* ========================================= */}
          {/* 右側：電腦版導航連結 (Desktop View) */}
          {/* ========================================= */}
          <div className="hidden md:flex space-x-1 items-center">
            {topLevelItems.map((item) => (
              <Link key={item.Menu_Title} href={item.URL_Path} className="px-3 py-2 rounded-full text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-all">
                {item.Menu_Title}
              </Link>
            ))}

            {moreDropdownItems.length > 0 && (
              <div className="relative group px-2">
                <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-all">
                  更多
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {moreDropdownItems.map((dropdownItem) => (
                      <Link key={dropdownItem.Menu_Title} href={dropdownItem.URL_Path} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        {dropdownItem.Menu_Title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================= */}
          {/* 手機版：漢堡選單 (Mobile View) */}
          {/* ========================================= */}
          <div className="md:hidden flex items-center">
            <details className="group relative">
              {/* 漢堡圖示按鈕 */}
              <summary className="list-none cursor-pointer p-2 text-gray-200 hover:text-white focus:outline-none">
                <svg className="h-6 w-6 block group-open:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                {/* 打開選單時變成 X 圖示 */}
                <svg className="h-6 w-6 hidden group-open:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </summary>

              {/* 手機版展開選單清單 */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col z-50">
                <div className="p-2 max-h-[80vh] overflow-y-auto">
                  
                  {/* 主要選單 */}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">主選單</div>
                  {topLevelItems.map((item) => (
                    <Link key={item.Menu_Title} href={item.URL_Path} className="block px-4 py-3 text-sm text-white hover:bg-slate-700 rounded-lg">
                      {item.Menu_Title}
                    </Link>
                  ))}

                  {/* 更多分類 */}
                  {moreDropdownItems.length > 0 && (
                    <>
                      <div className="w-full h-px bg-slate-700 my-2"></div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">更多分類與資訊</div>
                      {moreDropdownItems.map((item) => (
                        <Link key={item.Menu_Title} href={item.URL_Path} className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">
                          {item.Menu_Title}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>

        </div>
      </div>
    </nav>
  );
}