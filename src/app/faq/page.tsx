import { getSheetData } from '@/lib/google-sheets';

export const revalidate = 60;

export default async function FAQPage() {
  const faqData = await getSheetData('FAQ');

  const visibleFaqs = faqData
    .filter((faq) => faq.Display?.toLowerCase() === 'true')
    .sort((a, b) => (parseInt(a.Sort_Order) || 0) - (parseInt(b.Sort_Order) || 0));

  const groupedFaqs = visibleFaqs.reduce((acc, faq) => {
    const category = faq.Category || '一般問題';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof visibleFaqs>);

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
          {Object.entries(groupedFaqs).map(([category, faqs]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-blue-900 mb-6 border-b border-gray-200 pb-2">
                {category}
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
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