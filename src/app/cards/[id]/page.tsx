import { getSheetData } from '@/lib/google-sheets';
import { getThemeConfig } from '@/lib/theme';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 60;

const STANDARD_COLUMNS = [
  'Card_ID', 'Display', 'Manual_Sort', 'Card_Name_TC', 'Bank_Name', 
  'Card_Network', 'Card_Tier', 'Categories_Tags', 'Image_URL', 'Apply_Link', 'Official_Link',
  'Welcome_Offer_Main', 'Welcome_End_Date', 'Welcome_Conditions', 'Welcome_TC_Link',
  'Rate_Local', 'Rate_Foreign', 'Rate_Dining', 'Rate_Supermarket', 
  'Rate_PayMe', 'Rate_Octopus_Auto', 'Rate_Octopus_Manual', 
  'Miles_Rate_Local', 'Miles_Rate_Foreign', 'Miles_Rate_Dining', 'Miles_Partners', 'Miles_Fee', 'Miles_Validity',
  'Lounge_Access', 'Lounge_Details', 'Annual_Fee', 'Annual_Fee_Waiver', 'FX_Fee',
  'Pros', 'Pros_Remarks', 'Cons', 'Cons_Remarks', 'Summary_Review', 'Usage_Guide',
  'Customer_Hotline', 'Hotline_Tricks', 'Main_Content'
];

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const allCards = await getSheetData('Credit_Cards');
  const card = allCards.find((c) => c.Card_ID === params.id);
  if (!card) return { title: 'Card Not Found' };
  return {
    title: `${card.Card_Name_TC} 評價與迎新優惠 | 阿熹信用卡指南`,
    description: card.Summary_Review,
    openGraph: {
      title: `${card.Card_Name_TC} - 迎新優惠及回贈`,
      description: card.Summary_Review,
      images: [{ url: card.Image_URL || 'https://via.placeholder.com/1200x630' }],
    },
  };
}

// 🛠️ 自訂輕量級 Markdown 解析器
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const formatBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => 
        part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="text-gray-900 font-extrabold">{part.slice(2, -2)}</strong> : part
      );
    };

    if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl md:text-3xl font-bold mt-10 mb-5 text-gray-900 border-b pb-2">{formatBold(line.replace('## ', ''))}</h2>;
    if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold mt-8 mb-4 text-blue-900 flex items-center gap-2">{formatBold(line.replace('### ', ''))}</h3>;
    if (line.startsWith('* ')) return <li key={idx} className="ml-5 list-disc mb-3 text-gray-700 leading-relaxed">{formatBold(line.replace('* ', ''))}</li>;
    if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) return <li key={idx} className="ml-5 list-decimal mb-3 text-gray-700 leading-relaxed">{formatBold(line.replace(/^\d+\.\s/, ''))}</li>;
    if (line.trim() === '') return <div key={idx} className="h-4"></div>;
    
    return <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{formatBold(line)}</p>;
  });
};

export default async function CardDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const allCards = await getSheetData('Credit_Cards');
  const card = allCards.find((c) => c.Card_ID === params.id);
  if (!card) notFound();

  const allFaqs = await getSheetData('FAQ');
  const cardFaqs = allFaqs.filter((faq) => faq.Display?.toLowerCase() === 'true' && faq.Related_Card_ID === card.Card_ID);

  const { getTheme } = await getThemeConfig();
  const titleColor = getTheme('Card_Detail', 'Hero', 'Title', 'Text_Color', '#0f172a');
  const btnBg = getTheme('Card_Detail', 'Apply_Button', 'Background', 'Background_Color', '#2563eb');
  const btnText = getTheme('Card_Detail', 'Apply_Button', 'Text', 'Text_Color', '#ffffff');

  const prosList = card.Pros ? card.Pros.split('|').filter(Boolean) : [];
  const consList = card.Cons ? card.Cons.split('|').filter(Boolean) : [];
  const dynamicFeatures = Object.keys(card).filter((key) => !STANDARD_COLUMNS.includes(key) && card[key] !== '');

  const isMilesCard = card.Miles_Rate_Local && card.Miles_Rate_Local !== '不適用' && card.Miles_Rate_Local !== '--';

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ========================================== */}
        {/* 區塊 1: HERO (大圖、標題、申請按鈕)           */}
        {/* ========================================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          <div className="w-full md:w-1/3 flex-shrink-0 relative z-10">
            <img src={card.Image_URL || 'https://via.placeholder.com/400x250'} alt={card.Card_Name_TC} className="w-full rounded-2xl shadow-lg border border-gray-100" />
            {card.Official_Link && (
              <a href={card.Official_Link} target="_blank" className="block text-center mt-5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">查看銀行官方網頁 &rarr;</a>
            )}
          </div>
          <div className="w-full md:w-2/3 relative z-10">
            <div className="inline-block px-4 py-1.5 mb-4 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {card.Bank_Name} • {card.Card_Network} {card.Card_Tier}
            </div>
            <h1 style={{ color: titleColor }} className="text-3xl md:text-5xl font-extrabold mb-8">{card.Card_Name_TC}</h1>
            
            {card.Apply_Link && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: btnBg, color: btnText }} className="text-center font-bold py-4 px-10 rounded-xl shadow-md transition-transform hover:-translate-y-1 text-lg">
                  立即申請 Apply Now
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* 區塊 2: 迎新優惠 (緊接在 Hero 下方，最吸睛)    */}
        {/* ========================================== */}
        {card.Welcome_Offer_Main && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-sm">期間限定</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">🎁 迎新優惠詳情</h2>
            <p className="text-2xl font-black text-orange-600 mb-2">{card.Welcome_Offer_Main}</p>
            <p className="text-sm font-bold text-gray-500 mb-6 bg-gray-50 inline-block px-3 py-1 rounded-md">優惠期至：{card.Welcome_End_Date}</p>
            
            {card.Welcome_Conditions && (
              <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 mb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                <span className="font-extrabold text-orange-800 block mb-2">達成條件及要求：</span>
                {card.Welcome_Conditions}
              </div>
            )}
            {card.Welcome_TC_Link && (
              <a href={card.Welcome_TC_Link} target="_blank" className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-bold text-sm">📄 查看銀行官方迎新條款及細則 &rarr;</a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ========================================== */}
          {/* 區塊 3: 主內容區 (左側 2/3 寬度)             */}
          {/* ========================================== */}
          <div className="md:col-span-2 space-y-8">
            
            {/* 3.1 詳細評測文章 (移至最上方，緊接迎新優惠) */}
            {card.Main_Content && (
              <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-200">
                <article className="prose prose-blue max-w-none">
                  {renderMarkdown(card.Main_Content)}
                </article>
              </div>
            )}

            {/* 3.2 優點與缺點 Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 md:p-8 rounded-3xl border border-green-100 h-full flex flex-col">
                <h3 className="text-green-800 font-extrabold mb-5 flex items-center gap-2 text-xl"><span>✅ 優點 Pros</span></h3>
                <ul className="space-y-4 mb-5 flex-grow">
                  {prosList.map((pro: string, i: number) => <li key={i} className="text-sm md:text-base text-green-900 flex gap-3 font-medium"><span className="text-green-600">✓</span> <span>{pro}</span></li>)}
                </ul>
                {card.Pros_Remarks && (
                  <div className="bg-green-100 p-4 rounded-xl text-sm text-green-800 font-bold">
                    ✨ 特別優勢：<br/><span className="font-medium">{card.Pros_Remarks}</span>
                  </div>
                )}
              </div>
              <div className="bg-red-50 p-6 md:p-8 rounded-3xl border border-red-100 h-full flex flex-col">
                <h3 className="text-red-800 font-extrabold mb-5 flex items-center gap-2 text-xl"><span>❌ 缺點 Cons</span></h3>
                <ul className="space-y-4 mb-5 flex-grow">
                  {consList.map((con: string, i: number) => <li key={i} className="text-sm md:text-base text-red-900 flex gap-3 font-medium"><span className="text-red-500">✕</span> <span>{con}</span></li>)}
                </ul>
                {card.Cons_Remarks && (
                  <div className="bg-red-100 p-4 rounded-xl text-sm text-red-800 font-bold">
                    ⚠️ 注意事項：<br/><span className="font-medium">{card.Cons_Remarks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3.3 使用攻略 */}
            {card.Usage_Guide && (
              <div className="bg-indigo-50 p-8 rounded-3xl shadow-sm border border-indigo-100">
                <h2 className="text-xl font-extrabold text-indigo-900 mb-4 flex items-center gap-2">💡 阿熹使用攻略</h2>
                <p className="text-indigo-800 leading-relaxed whitespace-pre-line font-medium">{card.Usage_Guide}</p>
              </div>
            )}

            {/* 3.4 評價總結 (作為文章的總結，精準放置於 FAQ 之上) */}
            {card.Summary_Review && (
              <div className="bg-gradient-to-r from-blue-50 to-white p-8 rounded-3xl shadow-sm border border-blue-100 border-l-8 border-l-blue-600">
                <h2 className="text-xl font-extrabold text-blue-900 mb-3 flex items-center gap-2">💬 阿熹評價總結</h2>
                <p className="text-gray-800 leading-relaxed text-lg font-medium">{card.Summary_Review}</p>
              </div>
            )}

            {/* 3.5 常見問題 FAQs */}
            {cardFaqs.length > 0 && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-extrabold text-gray-900 mb-8">🤔 常見問題 FAQs</h2>
                <div className="space-y-6">
                  {cardFaqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <h3 className="text-md font-bold text-gray-900 mb-3 flex gap-3"><span className="text-blue-500 font-black">Q.</span>{faq.Question}</h3>
                      <p className="text-sm text-gray-600 flex gap-3 leading-relaxed"><span className="text-gray-300 font-black">A.</span>{faq.Answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* 區塊 4: 側邊欄 (右側 1/3 寬度)               */}
          {/* ========================================== */}
          <div className="space-y-6">
            
            {/* 4.1 飛行里數區塊 */}
            {isMilesCard && (
              <div className="bg-sky-50 p-6 rounded-3xl shadow-sm border border-sky-100">
                <h3 className="font-extrabold text-sky-900 mb-4 border-b border-sky-200 pb-3 flex items-center gap-2">✈️ 飛行里數 Earn Miles</h3>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between"><span className="text-sky-700">本地簽賬</span><span className="font-black text-sky-900">{card.Miles_Rate_Local || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-sky-700">外幣簽賬</span><span className="font-black text-sky-900">{card.Miles_Rate_Foreign || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-sky-700">餐飲簽賬</span><span className="font-black text-sky-900">{card.Miles_Rate_Dining || '--'}</span></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-sky-100 space-y-3 text-xs">
                  <div className="flex flex-col"><span className="text-gray-500 mb-1">里數計劃支援</span><span className="font-bold text-gray-900">{card.Miles_Partners || '--'}</span></div>
                  <div className="flex flex-col"><span className="text-gray-500 mb-1">兌換手續費</span><span className="font-bold text-gray-900">{card.Miles_Fee || '--'}</span></div>
                  <div className="flex flex-col"><span className="text-gray-500 mb-1">里數有效期</span><span className="font-bold text-gray-900">{card.Miles_Validity || '--'}</span></div>
                </div>
              </div>
            )}

            {/* 4.2 現金回贈 Earn Rates */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <h3 className="font-extrabold text-gray-900 mb-4 border-b pb-3">💳 現金回贈 Earn Rates</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">本地簽賬</span><span className="font-bold text-gray-900">{card.Rate_Local || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">外幣簽賬</span><span className="font-bold text-gray-900">{card.Rate_Foreign || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">餐飲簽賬</span><span className="font-bold text-gray-900">{card.Rate_Dining || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">超市簽賬</span><span className="font-bold text-gray-900">{card.Rate_Supermarket || '--'}</span></div>
              </div>
            </div>

            {/* 4.3 電子錢包 E-Wallets */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <h3 className="font-extrabold text-gray-900 mb-4 border-b pb-3">📱 電子錢包 E-Wallets</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">PayMe 增值</span><span className="font-bold text-gray-900">{card.Rate_PayMe || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">八達通自動增值</span><span className="font-bold text-gray-900">{card.Rate_Octopus_Auto || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">八達通手動 (Apple Pay)</span><span className="font-bold text-gray-900">{card.Rate_Octopus_Manual || '--'}</span></div>
              </div>
            </div>

            {/* 4.4 機場貴賓室 */}
            {card.Lounge_Access?.toLowerCase() === 'true' && (
              <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-200">
                <h3 className="font-extrabold text-amber-900 mb-3 border-b border-amber-200 pb-3 flex items-center gap-2">🛋️ 機場貴賓室</h3>
                <p className="text-sm text-amber-800 whitespace-pre-line leading-relaxed font-medium">
                  {card.Lounge_Details || '附屬免費貴賓室福利，詳情請參考官方條款。'}
                </p>
              </div>
            )}

            {/* 4.5 年費及手續費 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <h3 className="font-extrabold text-gray-900 mb-4 border-b pb-3">🧾 年費及手續費</h3>
              <div className="space-y-4 text-sm">
                <div className="flex flex-col"><span className="text-gray-500 mb-1">年費</span><span className="font-bold text-gray-900">{card.Annual_Fee || '--'}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 mb-1">年費豁免</span><span className="font-bold text-green-600">{card.Annual_Fee_Waiver || '--'}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 mb-1">外幣手續費</span><span className="font-bold text-gray-900">{card.FX_Fee || '--'}</span></div>
              </div>
            </div>

            {/* 4.6 客服熱線支援 */}
            {card.Customer_Hotline && (
              <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-sm">
                <h3 className="font-extrabold mb-4 border-b border-slate-600 pb-3 flex items-center gap-2">📞 客服熱線支援</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-400 mb-1">銀行聯絡電話</span>
                    <a href={`tel:${card.Customer_Hotline.replace(/\s+/g, '')}`} className="font-black text-xl text-blue-300 hover:text-blue-200">{card.Customer_Hotline}</a>
                  </div>
                  {card.Hotline_Tricks && (
                    <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                      <span className="text-slate-300 text-xs block mb-1">💡 快速接通真人攻略：</span>
                      <span className="font-bold text-white">{card.Hotline_Tricks}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </main>
  );
}