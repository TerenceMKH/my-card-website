import { getSheetData } from '@/lib/google-sheets';

// ⚡️ Revalidate the cache every 60 seconds (1 min)
export const revalidate = 60; 

export default async function Home() {
  // 1. Fetch data directly from your Google Sheet
  const allCards = await getSheetData('Credit_Cards');

  // 2. Filter and Sort the data
  const visibleCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .sort((a, b) => {
      const sortA = parseInt(a.Manual_Sort) || 0;
      const sortB = parseInt(b.Manual_Sort) || 0;
      return sortB - sortA; // Highest number shows up first
    });

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          HK Card Hub
        </h1>
        <p className="text-lg text-gray-600">
          Find the perfect credit card for your lifestyle and maximize your rewards.
        </p>
      </div>

      {/* Credit Card Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleCards.map((card) => (
          <div key={card.Card_ID} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
            
            {/* Card Header & Image */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
              <div className="w-32 h-20 relative flex-shrink-0 rounded-md overflow-hidden shadow-sm">
                {/* We use standard img tag here for external URLs from sheets to avoid Next.js domain config errors */}
                <img 
                  src={card.Card_Image_URL || 'https://via.placeholder.com/300x190?text=No+Image'} 
                  alt={card.Card_Name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{card.Card_Name}</h2>
                <p className="text-sm text-gray-500 font-medium">{card.Bank} • {card.Card_Network}</p>
              </div>
            </div>

            {/* Card Body (Details) */}
            <div className="p-6 flex-grow">
              <p className="text-gray-700 mb-4">{card.Short_Summary}</p>
              
              <div className="space-y-3 mb-6">
                {/* Dynamically pulling the specific columns we made */}
                {card['Welcome Offer'] && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Welcome Offer</span>
                    <span className="font-semibold text-green-600 text-right">{card['Welcome Offer']}</span>
                  </div>
                )}
                {card['Annual Fee'] && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Annual Fee</span>
                    <span className="font-semibold text-gray-800 text-right">{card['Annual Fee']}</span>
                  </div>
                )}
                {card['Local Earn Rate'] && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Local Earn Rate</span>
                    <span className="font-semibold text-gray-800 text-right">{card['Local Earn Rate']}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer (Buttons) */}
            <div className="p-6 pt-0 mt-auto flex gap-3">
              <a 
                href={`/cards/${card.Card_ID}`} 
                className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Read Review
              </a>
              {card.Apply_Link && (
                <a 
                  href={card.Apply_Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Apply Now
                </a>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </main>
  );
}