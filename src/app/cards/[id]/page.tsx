import { getSheetData } from '@/lib/google-sheets';
import { notFound } from 'next/navigation';

// These are the standard columns we DON'T want to show in the "Features" list
const STANDARD_COLUMNS = [
  'Card_ID', 'Display', 'Manual_Sort', 'Card_Name', 'Bank', 
  'Card_Network', 'Card_Tier', 'Categories_Tags', 'Short_Summary', 
  'Card_Image_URL', 'Apply_Link'
];

export default async function CardDetail(props: { params: Promise<{ id: string }> }) {
  // 1. Get the ID from the URL (e.g., "hsbc-everymile")
  const params = await props.params;
  const cardId = params.id;

  // 2. Fetch all cards and find the matching one
  const allCards = await getSheetData('Credit_Cards');
  const card = allCards.find((c) => c.Card_ID === cardId);

  // 3. If the card doesn't exist, show a 404 page
  if (!card) {
    notFound();
  }

  // 4. Magic Step: Automatically find any "extra" columns you added to the sheet
  const dynamicFeatures = Object.keys(card).filter(
    (key) => !STANDARD_COLUMNS.includes(key) && card[key] !== ''
  );

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Top Banner with Back Button */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <a href="/" className="text-blue-600 hover:underline font-medium text-sm">
            &larr; Back to all cards
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Card Image */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <img 
              src={card.Card_Image_URL || 'https://via.placeholder.com/400x250?text=No+Image'} 
              alt={card.Card_Name}
              className="w-full rounded-xl shadow-lg border border-gray-100"
            />
          </div>

          {/* Card Title & Main Action */}
          <div className="w-full md:w-2/3">
            <div className="inline-block px-3 py-1 mb-3 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {card.Bank} • {card.Card_Network} {card.Card_Tier}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              {card.Card_Name}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {card.Short_Summary}
            </p>
            
            {card.Apply_Link && (
              <a 
                href={card.Apply_Link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Apply on Official Website
              </a>
            )}
          </div>
        </div>

        <hr className="border-gray-100 mb-12" />

        {/* Dynamic Features Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Details & Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {dynamicFeatures.length > 0 ? (
              dynamicFeatures.map((featureKey) => (
                <div key={featureKey} className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    {featureKey}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {card[featureKey]}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">More details coming soon.</p>
            )}
          </div>
        </div>
        
      </div>
    </main>
  );
}