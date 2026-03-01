import { getSheetData } from '@/lib/google-sheets';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

export default async function CategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const categoryId = params.id.toLowerCase();

  // 1. 獲取分類資訊 (Title, Summary)
  const categoriesData = await getSheetData('Categories');
  const categoryMeta = categoriesData.find((c) => c.Category_ID?.toLowerCase() === categoryId);

  if (!categoryMeta) {
    notFound();
  }

  // 2. 獲取所有信用卡，並透過 Categories_Tags 篩選
  const allCards = await getSheetData('Credit_Cards');
  const categoryCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .filter((card) => {
      // 讀取 Categories_Tags 欄位，例如 "cashback, no-annual-fee"，並透過逗號拆分比對
      const tags = card.Categories_Tags?.toLowerCase().split(',').map((tag: string) => tag.trim()) || [];
      return tags.includes(categoryId);
    })
    .sort((a, b) => (parseInt(b.Manual_Sort) || 0) - (parseInt(a.Manual_Sort) || 0));

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-16">
      
      {/* 分類頁面標題區塊 */}
      <div className="bg-[#0f172a] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10 text-center md:text-left">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium mb-4 inline-block">
            &larr; 返回首頁
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {categoryMeta.Page_Title}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-slate-300 leading-relaxed">
            {categoryMeta.Page_Summary}
          </p>
        </div>
      </div>

      {/* 篩選後的信用卡列表 */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800">
            我們找到 <span className="text-blue-600">{categoryCards.length}</span> 張適合你的信用卡
          </h2>
        </div>

        {categoryCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {categoryCards.map((card) => (
              <div key={card.Card_ID} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow p-6 gap-6">
                
                {/* 左側：卡片圖片 */}
                <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-center justify-center">
                  <img 
                    src={card.Image_URL || 'https://via.placeholder.com/300x190'} 
                    alt={card.Card_Name_TC}
                    className="w-full max-w-[200px] rounded-xl shadow-sm border border-gray-100 mb-3"
                  />
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                    {card.Bank_Name}
                  </div>
                </div>

                {/* 中間：卡片資訊與迎新 */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.Card_Name_TC}</h3>
                  <p className="text-sm text-gray-600 mb-4">{card.Summary_Review}</p>
                  
                  {card.Welcome_Offer_Main && (
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm font-medium border border-orange-100 mb-4 inline-block w-full">
                      <span className="font-bold mr-2">🎁 迎新優惠:</span> 
                      {card.Welcome_Offer_Main}
                    </div>
                  )}

                  <div className="flex gap-4 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                    <div><span className="text-gray-500 mr-2">本地簽賬:</span><span className="font-bold text-gray-900">{card.Rate_Local || '--'}</span></div>
                    <div className="w-px bg-gray-300"></div>
                    <div><span className="text-gray-500 mr-2">外幣簽賬:</span><span className="font-bold text-gray-900">{card.Rate_Foreign || '--'}</span></div>
                  </div>
                </div>

                {/* 右側：行動按鈕 */}
                <div className="w-full md:w-48 flex-shrink-0 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                  <Link href={`/cards/${card.Card_ID}`} className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors text-sm">
                    詳細評價
                  </Link>
                  {card.Apply_Link && (
                    <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm">
                      立即申請
                    </a>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">此分類暫時未有相關的信用卡推介。</p>
            <p className="text-gray-400 text-sm mt-2">請嘗試瀏覽其他分類或稍後再回來查看。</p>
          </div>
        )}
      </div>
    </main>
  );
}