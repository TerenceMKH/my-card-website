import { getSheetData } from '@/lib/google-sheets';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// ⚡️ Add this line: Revalidate the cache every 60 seconds (1 min)
export const revalidate = 60; 

export default async function CategoryPage(props: { params: Promise<{ id: string }> }) {
  // 1. Get the category ID from the URL (e.g., "dining")
  const params = await props.params;
  const categoryId = params.id.toLowerCase();

  // 2. Fetch the Category details (Title, Summary, Hero Image)
  const categoriesData = await getSheetData('Categories');
  const categoryMeta = categoriesData.find((c) => c.Category_ID?.toLowerCase() === categoryId);

  // If the category doesn't exist in the sheet, show 404
  if (!categoryMeta) {
    notFound();
  }

  // 3. Fetch ALL cards and filter them by this category
  const allCards = await getSheetData('Credit_Cards');
  const categoryCards = allCards
    .filter((card) => card.Display?.toLowerCase() === 'true')
    .filter((card) => {
      // Look at the "Categories_Tags" column, split by commas, and check for a match
      const tags = card.Categories_Tags?.toLowerCase().split(',').map(tag => tag.trim()) || [];
      return tags.includes(categoryId);
    })
    .sort((a, b) => {
      const sortA = parseInt(a.Manual_Sort) || 0;
      const sortB = parseInt(b.Manual_Sort) || 0;
      return sortB - sortA; 
    });

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Navigation Bar Placeholder (We can build a real one later) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <a href="/" className="text-blue-600 hover:underline font-bold text-lg">
            HK Card Hub
          </a>
        </div>
      </div>

      {/* Category Hero Section */}
      <div className="bg-blue-900 text-white relative overflow-hidden">
        {/* Optional background image overlay */}
        {categoryMeta.Hero_Image_URL && (
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${categoryMeta.Hero_Image_URL})` }}
          />
        )}
        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {categoryMeta.Page_Title}
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-blue-100">
            {categoryMeta.Page_Summary}
          </p>
        </div>
      </div>

      {/* Filtered Cards Grid */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Showing {categoryCards.length} {categoryCards.length === 1 ? 'card' : 'cards'}
        </h2>

        {categoryCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categoryCards.map((card) => (
              <div key={card.Card_ID} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
                
                {/* Card Header & Image */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-24 h-16 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                    <img 
                      src={card.Card_Image_URL || 'https://via.placeholder.com/300x190?text=Card'} 
                      alt={card.Card_Name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{card.Card_Name}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase mt-1">{card.Bank}</p>
                  </div>
                </div>

                {/* Card Summary */}
                <div className="p-6 flex-grow">
                  <p className="text-gray-600 text-sm mb-4">{card.Short_Summary}</p>
                  {/* Highlighted Feature */}
                  {card['Welcome Offer'] && (
                    <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm font-semibold border border-green-100">
                      🎁 {card['Welcome Offer']}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto flex gap-3">
                  <a href={`/cards/${card.Card_ID}`} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    Details
                  </a>
                  {card.Apply_Link && (
                    <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                      Apply Now
                    </a>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No active cards found for this category yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}