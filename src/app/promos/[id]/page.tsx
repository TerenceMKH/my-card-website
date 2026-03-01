import { getSheetData } from '@/lib/google-sheets';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ⚡️ Add this line: Revalidate the cache every 60 seconds (1 min)
export const revalidate = 60; 

export default async function PromoArticle(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const postId = params.id;

  // 1. Fetch the specific article
  const allPromos = await getSheetData('Blog_Promos');
  const post = allPromos.find((p) => p.Post_ID === postId);

  if (!post) {
    notFound();
  }

  // 2. The Magic Step: Find the related credit cards!
  // We take the comma-separated IDs (e.g., "hsbc-everymile, scb-smart") and turn them into an array
  const relatedCardIds = post.Related_Cards
  ? post.Related_Cards.split(',').map((id: string) => id.trim())
  : [];

  const allCards = await getSheetData('Credit_Cards');
  const relatedCards = allCards.filter((card) => relatedCardIds.includes(card.Card_ID));

  return (
    <main className="min-h-screen bg-white py-12 font-sans">
      <article className="max-w-3xl mx-auto px-6">
        
        {/* Article Header */}
        <div className="mb-10 border-b border-gray-100 pb-8">
          <div className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
            {post.Publish_Date}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.Title}
          </h1>
          {post.Source_Link && (
            <a 
              href={post.Source_Link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              🔗 Read Official T&C Source
            </a>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed mb-16 whitespace-pre-line">
          {/* whitespace-pre-line makes sure any 'Enter' key presses in Google Sheets show up as actual line breaks here */}
          {post.Content}
        </div>

        {/* Related Cards Section */}
        {relatedCards.length > 0 && (
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Cards mentioned in this offer:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {relatedCards.map((card) => (
                <Link key={card.Card_ID} href={`/cards/${card.Card_ID}`} className="group block bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <img 
                      src={card.Card_Image_URL || 'https://via.placeholder.com/100x60'} 
                      alt={card.Card_Name}
                      className="w-16 h-10 object-cover rounded shadow-sm border border-gray-100"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                        {card.Card_Name}
                      </h4>
                      <p className="text-xs text-gray-500">{card.Bank}</p>
                    </div>
                  </div>
                </Link>
              ))}

            </div>
          </div>
        )}

      </article>
    </main>
  );
}