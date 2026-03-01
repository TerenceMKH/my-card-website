import { getSheetData } from '@/lib/google-sheets';
import { getThemeConfig } from '@/lib/theme';
import Link from 'next/link';

export const revalidate = 60; 

export default async function Home() {
  const allCards = await getSheetData('Credit_Cards');
  const settingsData = await getSheetData('Site_Settings');
  const allPromos = await getSheetData('Blog_Promos');

  const { getTheme } = await getThemeConfig();
  const getSetting = (key: string, fallback: string) => settingsData.find(s => s.Key === key)?.Value || fallback;
  
  const heroTitle = getSetting('HomeHeroTitle', '全港最佳信用卡比較');
  const heroSubtitle = getSetting('HomeHeroSubtitle', '為你比較高達8%現金回贈、迎新優惠及免年費信用卡，輕鬆賺盡每一蚊！');

  const heroTitleSize = getTheme('Home', 'Hero_Banner', 'Title', 'Font_Size', '2.5rem');
  const heroTitleColor = getTheme('Home', 'Hero_Banner', 'Title', 'Text_Color', '#0f172a');
  const btnBg = getTheme('Card_Detail', 'Apply_Button', 'Background', 'Background_Color', '#2563eb');
  const btnText = getTheme('Card_Detail', 'Apply_Button', 'Text', 'Text_Color', '#ffffff');

  // 取出 Manual_Sort 最高的前 4 張卡作為「本月精選」
  const topCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .sort((a, b) => (parseInt(b.Manual_Sort) || 0) - (parseInt(a.Manual_Sort) || 0))
    .slice(0, 4);

  const latestPromos = allPromos
    .filter((post) => post.Display?.toLowerCase() === 'true')
    .sort((a, b) => new Date(b.Publish_Date).getTime() - new Date(a.Publish_Date).getTime())
    .slice(0, 3);

  // 更新為與 Google Sheets 完全一致的快速分類
  const quickCategories = [
    { title: '迎新優惠', icon: '🎁', slug: 'welcome-offer' },
    { title: '現金回贈', icon: '💰', slug: 'cashback' },
    { title: '飛行里數', icon: '✈️', slug: 'miles' },
    { title: '網上購物', icon: '🛒', slug: 'online-shopping' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-16">
      
      {/* 英雄區塊 (Hero Section) */}
      <div className="bg-white border-b border-gray-200 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 style={{ fontSize: heroTitleSize, color: heroTitleColor }} className="font-extrabold mb-4 tracking-tight">
            {heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* 快速分類 (Quick Categories) */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickCategories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center hover:border-blue-500 hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <div className="font-bold text-gray-800 text-md">{cat.title}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 本月精選信用卡 */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">🔥 本月精選信用卡推介</h2>
            <p className="text-gray-500 mt-2">經編輯嚴選，本月最抵申請的熱門信用卡</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {topCards.map((card) => (
            <div key={card.Card_ID} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.Bank_Name}</span>
                <span className="text-xs font-bold text-slate-500">{card.Card_Network}</span>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <img src={card.Image_URL || 'https://via.placeholder.com/300x190'} alt={card.Card_Name_TC} className="w-40 rounded-lg shadow-sm border border-gray-100" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.Card_Name_TC}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{card.Summary_Review}</p>
                </div>
              </div>

              <div className="px-6 pb-6 flex-grow">
                {card.Welcome_Offer_Main && (
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-4 text-sm">
                    <span className="font-bold text-orange-600 block mb-1">🎁 迎新優惠</span>
                    <span className="text-gray-900 font-medium leading-snug">{card.Welcome_Offer_Main}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
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

              <div className="p-6 pt-0 mt-auto flex gap-3">
                <Link href={`/cards/${card.Card_ID}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors text-sm">
                  詳細評價
                </Link>
                {card.Apply_Link && (
                  <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: btnBg, color: btnText }} className="flex-1 text-center font-bold py-3 px-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity text-sm">
                    立即申請
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}