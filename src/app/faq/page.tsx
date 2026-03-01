import { getSheetData } from '@/lib/google-sheets';

export const revalidate = 60;

export default async function FAQPage() {
  const faqData = await getSheetData('FAQ');

  // 明確指定 faq, a, b 為 any 型別
  const visibleFaqs = faqData
    .filter((faq: any) => faq.Display?.toLowerCase() === 'true')
    .sort((a: any, b: any) => (parseInt(a.Sort_Order) || 0) - (parseInt(b.Sort_Order) || 0));

  // 明確指定 acc, faq 為 any 型別
  const groupedFaqs = visibleFaqs.reduce((acc: any, faq: any) => {
    const category = faq.Category || '一般問題';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50 py-16 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">常見問題</h1>
          <p className="text-lg text-gray-600">
            解答你對申請信用卡及賺取回贈的所有疑問，阿熹幫你避開中伏位！
          </p>
        </div>

        <div className="space-y-12">
          {/* 在這裡加入 [string, any] 型別宣告，讓 Vercel 知道 faqs 是可以 map 的 */}
          {Object.entries(groupedFaqs).map(([category, faqs]: [string, any]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-blue-900 mb-6 border-b border-gray-200 pb-2">
                {category}
              </h2>
              <div className="space-y-6">
                {/* 明確標示 faq 和 index 的型別 */}
                {faqs.map((faq: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                      <span className="text-blue-500 font-black mt-1">Q.</span>
                      {faq.Question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed flex items-start gap-3">
                      <span className="text-gray-400 font-black mt-1">A.</span>
                      {faq.Answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}