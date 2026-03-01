import { getSheetData } from '@/lib/google-sheets';
import { getThemeConfig } from '@/lib/theme';
import Link from 'next/link';

export const revalidate = 60; 

export default async function Home() {
  const allCards = await getSheetData('Credit_Cards');
  const settingsData = await getSheetData('Site_Settings');
  const allPromos = await getSheetData('Blog_Promos');
  const categoriesData = await getSheetData('Categories');

  const { getTheme } = await getThemeConfig();
  const getSetting = (key: string, fallback: string) => settingsData.find(s => s.Key === key)?.Value || fallback;
  
  const heroTitle = getSetting('HomeHeroTitle', '阿熹信用卡指南');
  const heroSubtitle = getSetting('HomeHeroSubtitle', '為你比較高達8%現金回贈、迎新優惠及免年費信用卡，輕鬆賺盡每一蚊！');

  const heroTitleSize = getTheme('Home', 'Hero_Banner', 'Title', 'Font_Size', '2.5rem');
  const heroTitleColor = getTheme('Home', 'Hero_Banner', 'Title', 'Text_Color', '#0f172a');
  const btnBg = getTheme('Card_Detail', 'Apply_Button', 'Background', 'Background_Color', '#2563eb');
  const btnText = getTheme('Card_Detail', 'Apply_Button', 'Text', 'Text_Color', '#ffffff');

  const topCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .sort((a, b) => (parseInt(b.Manual_Sort) || 0) - (parseInt(a.Manual_Sort) || 0))
    .slice(0, 3);

  const latestPromos = allPromos
    .filter((post) => post.Display?.toLowerCase() === 'true')
    .sort((a, b) => new Date(b.Publish_Date).getTime() - new Date(a.Publish_Date).getTime())
    .slice(0, 3);

  const quickCategories = [
    { title: '迎新優惠', icon: '🎁', slug: 'welcome-offer' },
    { title: '現金回贈', icon: '💰', slug: 'cashback' },
    { title: '飛行里數', icon: '✈️', slug: 'miles' },
    { title: '網上購物', icon: '🛒', slug: 'online-shopping' },
    { title: '外幣簽賬', icon: '💱', slug: 'foreign-spend' },
  ];

  return (
    <main className="min-h-screen font-sans pb-16 bg-gray-50">
      
      {/* 英雄區塊 */}
      <div className="bg-white border-b border-gray-200 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 style={{ fontSize: heroTitleSize, color: heroTitleColor }} className="font-extrabold mb-4 tracking-tight">{heroTitle}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{heroSubtitle}</p>
        </div>
      </div>

      {/* 快速分類 */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickCategories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center hover:border-blue-500 hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{cat.title}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 最新情報 */}
      {latestPromos.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 mt-16">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-extrabold text-gray-900">📰 最新情報</h2>
            <Link href="/promos" className="text-blue-600 font-semibold text-sm hover:underline">查看全部 &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPromos.map((promo) => (
              <Link key={promo.Post_ID} href={`/promos/${promo.Post_ID}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
                <div className="text-xs font-bold text-blue-500 mb-3">{promo.Publish_Date}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{promo.Title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{promo.Content}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 本月精選 */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">🔥 本月精選</h2>
            <p className="text-gray-500 mt-1 text-sm">經阿熹嚴選，本月最抵申請的熱門信用卡</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topCards.map((card) => {
            const firstTagSlug = card.Categories_Tags?.split(',')[0]?.trim().toLowerCase();
            const matchedCategory = categoriesData.find(c => c.Category_ID?.toLowerCase() === firstTagSlug);
            const displayCategory = matchedCategory ? matchedCategory.Page_Title.replace('信用卡', '') : card.Bank_Name;
            
            // 將 Pros 切割成陣列，準備顯示成列表
            const prosList = card.Pros ? card.Pros.split('|').filter(Boolean) : [];

            return (
              <div key={card.Card_ID} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                
                {/* 頂部標籤 */}
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{displayCategory}</span>
                  <span className="text-xs font-bold text-slate-500">{card.Card_Network}</span>
                </div>

                {/* 圖片與標題 (加入了 Link 與 Hover 效果) */}
                <Link href={`/cards/${card.Card_ID}`} className="p-5 flex flex-col items-center group cursor-pointer">
                  <img 
                    src={card.Image_URL || 'https://via.placeholder.com/300x190'} 
                    alt={card.Card_Name_TC} 
                    className="w-full max-w-[200px] rounded-lg shadow-sm border border-gray-100 mb-4 group-hover:scale-105 transition-transform duration-300" 
                  />
                  <h3 className="text-lg font-bold text-gray-900 text-center line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {card.Card_Name_TC}
                  </h3>
                </Link>

                <div className="px-5 pb-5 flex-grow">
                  {card.Welcome_Offer_Main && (
                    <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-4 text-xs">
                      <span className="font-bold text-orange-600 block mb-1">🎁 迎新優惠</span>
                      <span className="text-gray-900 font-medium line-clamp-2">{card.Welcome_Offer_Main}</span>
                    </div>
                  )}
                  
                  {/* 優勢列表 (取代原本的回贈區塊) */}
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <span className="font-bold text-green-800 block mb-2 text-xs">✨ 核心優勢</span>
                    <ul className="space-y-1.5">
                      {prosList.slice(0, 3).map((pro: string, i: number) => (
                        <li key={i} className="text-xs text-green-900 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5 font-bold">✓</span> 
                          <span className="line-clamp-1">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-auto flex gap-2">
                  <Link href={`/cards/${card.Card_ID}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-2 rounded-xl transition-colors text-sm">詳細評價</Link>
                  {card.Apply_Link && (
                    <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: btnBg, color: btnText }} className="flex-1 text-center font-bold py-2 px-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity text-sm">立即申請</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/cards" className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-10 rounded-full transition-all text-lg shadow-sm">
            查看全部信用卡 &rarr;
          </Link>
        </div>
      </div>

    </main>
  );
}