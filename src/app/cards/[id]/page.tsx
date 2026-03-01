import { getSheetData } from '@/lib/google-sheets';
import { getThemeConfig } from '@/lib/theme';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 60;

// Standard columns we handle manually in the layout. Anything NOT here gets put in the "Dynamic Features" list automatically.
const STANDARD_COLUMNS = [
  'Card_ID', 'Display', 'Manual_Sort', 'Card_Name_TC', 'Card_Name_EN', 'Bank_Name', 
  'Card_Network', 'Card_Tier', 'Categories_Tags', 'Image_URL', 'Apply_Link', 'Official_Link',
  'Welcome_Offer_Main', 'Welcome_End_Date', 'Rate_Local', 'Rate_Foreign', 'Rate_Dining', 
  'Rate_Supermarket', 'Rate_PayMe', 'Rate_Octopus', 'Annual_Fee', 'Annual_Fee_Waiver', 'FX_Fee',
  'Pros', 'Cons', 'Summary_Review'
];

// ⚡️ Dynamic SEO Meta Tags
export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const allCards = await getSheetData('Credit_Cards');
  const card = allCards.find((c) => c.Card_ID === params.id);

  if (!card) return { title: 'Card Not Found' };

  return {
    title: `${card.Card_Name_TC} 評價 | HK Card Hub`,
    description: card.Summary_Review || 'Discover the latest welcome offers and cash rebates.',
    openGraph: {
      title: `${card.Card_Name_TC} - 迎新優惠及回贈`,
      description: card.Summary_Review || 'Find out if this is the right credit card for you.',
      images: [{ url: card.Image_URL || 'https://via.placeholder.com/1200x630' }],
    },
  };
}

export default async function CardDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  // Fetch Card Data
  const allCards = await getSheetData('Credit_Cards');
  const card = allCards.find((c) => c.Card_ID === params.id);
  if (!card) notFound();

  // Fetch FAQ Data & Filter for this specific card
  const allFaqs = await getSheetData('FAQ');
  const cardFaqs = allFaqs.filter((faq) => faq.Display?.toLowerCase() === 'true' && faq.Related_Card_ID === card.Card_ID);

  // Fetch Theme
  const { getTheme } = await getThemeConfig();
  const titleColor = getTheme('Card_Detail', 'Hero', 'Title', 'Text_Color', '#0f172a');
  const btnBg = getTheme('Card_Detail', 'Apply_Button', 'Background', 'Background_Color', '#2563eb');
  const btnText = getTheme('Card_Detail', 'Apply_Button', 'Text', 'Text_Color', '#ffffff');

  // Parse Pros and Cons (split by the pipe '|' symbol)
  const prosList = card.Pros ? card.Pros.split('|').filter(Boolean) : [];
  const consList = card.Cons ? card.Cons.split('|').filter(Boolean) : [];
  
  // Find any extra dynamic features you added to the sheet
  const dynamicFeatures = Object.keys(card).filter((key) => !STANDARD_COLUMNS.includes(key) && card[key] !== '');

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* SECTION 1: HERO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <img src={card.Image_URL || 'https://via.placeholder.com/400x250'} alt={card.Card_Name_TC} className="w-full rounded-xl shadow-md border border-gray-200" />
          </div>
          <div className="w-full md:w-2/3">
            <div className="inline-block px-3 py-1 mb-3 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
              {card.Bank_Name} • {card.Card_Network} {card.Card_Tier}
            </div>
            <h1 style={{ color: titleColor }} className="text-3xl md:text-4xl font-extrabold mb-4">{card.Card_Name_TC}</h1>
            
            {card.Welcome_Offer_Main && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-600 font-bold uppercase tracking-wide mb-1">🎁 迎新優惠 (至 {card.Welcome_End_Date})</p>
                <p className="text-lg font-bold text-gray-900">{card.Welcome_Offer_Main}</p>
              </div>
            )}
            
            {card.Apply_Link && (
              <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: btnBg, color: btnText }} className="block w-full md:w-auto text-center font-bold py-4 px-8 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                立即申請 Apply Now
              </a>
            )}
          </div>
        </div>

        {/* SECTION 2: AT A GLANCE (Earn Rates) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '本地簽賬', value: card.Rate_Local, icon: '🏠' },
            { label: '外幣簽賬', value: card.Rate_Foreign, icon: '✈️' },
            { label: '餐飲簽賬', value: card.Rate_Dining, icon: '🍽️' },
            { label: '超市簽賬', value: card.Rate_Supermarket, icon: '🛒' },
          ].map((stat, i) => stat.value && (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-sm text-gray-500 font-medium mb-1">{stat.label}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Column (Pros, Cons, Review) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Pros & Cons */}
            {(prosList.length > 0 || consList.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2"><span>優點 Pros</span></h3>
                  <ul className="space-y-3">
                    {prosList.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                        <span className="mt-0.5">✅</span> <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2"><span>缺點 Cons</span></h3>
                  <ul className="space-y-3">
                    {consList.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                        <span className="mt-0.5">❌</span> <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Detailed Review */}
            {card.Summary_Review && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">評價總結 Review</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{card.Summary_Review}</p>
              </div>
            )}
            
            {/* Associated FAQs */}
            {cardFaqs.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">常見問題 FAQs</h2>
                <div className="space-y-6">
                  {cardFaqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <h3 className="text-md font-bold text-gray-900 mb-2 flex gap-2"><span className="text-blue-500">Q.</span>{faq.Question}</h3>
                      <p className="text-sm text-gray-600 flex gap-2"><span className="text-gray-400 font-bold">A.</span>{faq.Answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Fees & E-Wallets) */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">電子錢包 E-Wallets</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">PayMe 增值</span><span className="font-semibold">{card.Rate_PayMe || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">八達通增值</span><span className="font-semibold">{card.Rate_Octopus || '--'}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">年費及手續費 Fees</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between flex-col mb-2"><span className="text-gray-500">年費 Annual Fee</span><span className="font-semibold">{card.Annual_Fee || '--'}</span></div>
                <div className="flex justify-between flex-col mb-2"><span className="text-gray-500">年費豁免 Waiver</span><span className="font-semibold">{card.Annual_Fee_Waiver || '--'}</span></div>
                <div className="flex justify-between flex-col"><span className="text-gray-500">外幣手續費 FX Fee</span><span className="font-semibold">{card.FX_Fee || '--'}</span></div>
              </div>
            </div>

            {/* Dynamic Features Rendered Here */}
            {dynamicFeatures.length > 0 && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold mb-4 border-b border-slate-700 pb-2">其他特點 Other Features</h3>
                <div className="space-y-3 text-sm">
                  {dynamicFeatures.map((key) => (
                    <div key={key} className="flex justify-between flex-col mb-2">
                      <span className="text-slate-400">{key}</span>
                      <span className="font-semibold text-slate-100">{card[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}