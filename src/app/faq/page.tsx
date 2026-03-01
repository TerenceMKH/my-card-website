import { getSheetData } from '@/lib/google-sheets';

export default async function FAQPage() {
  // 1. Fetch FAQ data from the Google Sheet
  const faqData = await getSheetData('FAQ');

  // 2. Filter hidden questions and sort them by your manual order
  const visibleFaqs = faqData
    .filter((faq) => faq.Display?.toLowerCase() === 'true')
    .sort((a, b) => {
      const sortA = parseInt(a.Sort_Order) || 0;
      const sortB = parseInt(b.Sort_Order) || 0;
      return sortA - sortB; 
    });

  // 3. Group the FAQs by Category (e.g., General, Rewards)
  const groupedFaqs = visibleFaqs.reduce((acc, faq) => {
    const category = faq.Category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof visibleFaqs>);

  return (
    <main className="min-h-screen bg-gray-50 py-16 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about applying for and maximizing your credit cards.
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
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                      <span className="text-blue-500 font-black">Q.</span>
                      {faq.Question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed flex items-start gap-3">
                      <span className="text-gray-400 font-black">A.</span>
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