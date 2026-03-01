import { getSheetData } from '@/lib/google-sheets';
import { getThemeConfig } from '@/lib/theme';
import Link from 'next/link';

export const revalidate = 60; 

export default async function Home() {
  // 1. Fetch Data
  const allCards = await getSheetData('Credit_Cards');
  const settingsData = await getSheetData('Site_Settings');
  const allPromos = await getSheetData('Blog_Promos');

  // 2. Fetch Theme Settings
  const { getTheme } = await getThemeConfig();
  const getSetting = (key: string, fallback: string) => settingsData.find(s => s.Key === key)?.Value || fallback;
  
  const heroTitle = getSetting('HomeHeroTitle', 'Find Your Perfect Credit Card');
  const heroSubtitle = getSetting('HomeHeroSubtitle', 'Compare the best cash rebates and miles cards in Hong Kong.');

  const heroTitleSize = getTheme('Home', 'Hero_Banner', 'Title', 'Font_Size', '2.5rem');
  const heroTitleColor = getTheme('Home', 'Hero_Banner', 'Title', 'Text_Color', '#1e3a8a');
  const btnBg = getTheme('Card_Detail', 'Apply_Button', 'Background', 'Background_Color', '#2563eb');
  const btnText = getTheme('Card_Detail', 'Apply_Button', 'Text', 'Text_Color', '#ffffff');

  // 3. Process Data
  // Get top 4 cards sorted by Manual_Sort
  const topCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .sort((a, b) => (parseInt(b.Manual_Sort) || 0) - (parseInt(a.Manual_Sort) || 0))
    .slice(0, 4);

  // Get top 3 latest promos
  const latestPromos = allPromos
    .filter((post) => post.Display?.toLowerCase() === 'true')
    .sort((a, b) => new Date(b.Publish_Date).getTime() - new Date(a.Publish_Date).getTime())
    .slice(0, 3);

  // Quick category links (You can customize these icons and slugs)
  const quickCategories = [
    { title: '現金回贈 Cashback', icon: '💰', slug: 'cashback' },
    { title: '飛行里數 Miles', icon: '✈️', slug: 'miles' },
    { title: '餐飲優惠 Dining', icon: '🍽️', slug: 'dining' },
    { title: '網上購物 Online', icon: '🛒', slug: 'online' },
  ];

  return (
    <main className="min-h-screen font-sans pb-16">
      
      {/* SECTION 1: HERO */}
      <div className="bg-white border-b border-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 style={{ fontSize: heroTitleSize, color: heroTitleColor }} className="font-extrabold mb-4 tracking-tight">
            {heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* SECTION 2: QUICK CATEGORIES */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickCategories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 text-center hover:border-blue-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{cat.title}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION 3: TOP PICKS OF THE MONTH */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">本月精選 Top Picks</h2>
            <p className="text-gray-500 mt-2">Highest rated cards by our editors this month.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {topCards.map((card) => (
            <div key={card.Card_ID} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              {/* Top Banner (Bank & Network) */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.Bank_Name}</span>
                <span className="text-xs font-bold text-slate-500">{card.Card_Network}</span>
              </div>

              {/* Card Info */}
              <div className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <img src={card.Image_URL || 'https://via.placeholder.com/300x190?text=Card'} alt={card.Card_Name_TC} className="w-40 rounded-lg shadow-md border border-gray-100" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.Card_Name_TC}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{card.Summary_Review}</p>
                </div>
              </div>

              {/* Highlights (Welcome Offer & Key Rates) */}
              <div className="px-6 pb-6 flex-grow">
                {card.Welcome_Offer_Main && (
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg mb-4 text-sm">
                    <span className="font-bold text-orange-600 block mb-1">🎁 迎新優惠 Welcome Offer</span>
                    <span className="text-gray-900 font-medium">{card.Welcome_Offer_Main}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-center flex-1 border-r border-gray-200">
                    <span className="block text-gray-500 text-xs mb-1">本地簽賬</span>
                    <span className="font-bold text-gray-900">{card.Rate_Local || '--'}</span>
                  </div>
                  <div className="text-center flex-1">
                    <span className="block text-gray-500 text-xs mb-1">外幣簽賬</span>
                    <span className="font-bold text-gray-900">{card.Rate_Foreign || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 mt-auto flex gap-3">
                <Link href={`/cards/${card.Card_ID}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors text-sm">
                  詳細評價 Review
                </Link>
                {card.Apply_Link && (
                  <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: btnBg, color: btnText }} className="flex-1 text-center font-bold py-3 px-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity text-sm">
                    立即申請 Apply
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: LATEST PROMOTIONS (Blog) */}
      {latestPromos.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-20">
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-extrabold text-gray-900">最新情報 Latest News</h2>
            <Link href="/promos" className="text-blue-600 font-semibold text-sm hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPromos.map((promo) => (
              <Link key={promo.Post_ID} href={`/promos/${promo.Post_ID}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="text-xs font-bold text-blue-500 mb-3">{promo.Publish_Date}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {promo.Title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {promo.Content}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}