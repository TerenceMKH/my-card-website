import { getSheetData } from '@/lib/google-sheets';
import { getThemeConfig } from '@/lib/theme';
import CardFilter from '@/components/CardFilter';

export const revalidate = 60;

export const metadata = {
  title: '全部信用卡比較 | 阿熹信用卡指南',
  description: '使用進階篩選功能，快速比較全港銀行信用卡，找出最適合你的里數或現金回贈卡。'
};

export default async function AllCardsPage() {
  // 1. 抓取所有卡片與分類資料
  const allCards = await getSheetData('Credit_Cards');
  const categories = await getSheetData('Categories');
  
  // 2. 獲取按鈕設計主題
  const { getTheme } = await getThemeConfig();
  const btnBg = getTheme('Card_Detail', 'Apply_Button', 'Background', 'Background_Color', '#2563eb');
  const btnText = getTheme('Card_Detail', 'Apply_Button', 'Text', 'Text_Color', '#ffffff');

  // 3. 過濾隱藏卡片並按 Google Sheets 內的 Manual_Sort 進行預設排序
  const visibleCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .sort((a, b) => (parseInt(b.Manual_Sort) || 0) - (parseInt(a.Manual_Sort) || 0));

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-16">
      {/* 頂部標題 */}
      <div className="bg-[#0f172a] text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">全部信用卡比較</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          透過獨家進階篩選器，自訂你的搜尋條件（如特定銀行、Visa/Mastercard、免年費等），精準找出最適合你的信用卡。
        </p>
      </div>

      {/* 載入客戶端篩選組件 */}
      <CardFilter 
        cards={visibleCards} 
        categories={categories} 
        btnBg={btnBg} 
        btnText={btnText} 
      />
    </main>
  );
}