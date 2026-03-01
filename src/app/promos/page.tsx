import { getSheetData } from '@/lib/google-sheets';
import Link from 'next/link';

export default async function PromosIndex() {
  // 1. Fetch the blog data
  const allPromos = await getSheetData('Blog_Promos');

  // 2. Filter hidden posts and sort by Publish Date (newest first)
  const visiblePromos = allPromos
    .filter((post) => post.Display?.toLowerCase() === 'true')
    .sort((a, b) => {
      const dateA = new Date(a.Publish_Date).getTime();
      const dateB = new Date(b.Publish_Date).getTime();
      return dateB - dateA; 
    });

  return (
    <main className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Latest Promotions</h1>
          <p className="text-lg text-gray-600">
            Stay up to date with the newest credit card welcome offers and limited-time rebates.
          </p>
        </div>

        {/* Blog Post List */}
        <div className="space-y-6">
          {visiblePromos.map((post) => (
            <div key={post.Post_ID} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
              <div className="text-sm text-gray-500 mb-2 font-medium">
                Published: {post.Publish_Date}
                {post.Update_Date && post.Update_Date !== post.Publish_Date && (
                  <span className="ml-3 text-blue-600 italic">Updated: {post.Update_Date}</span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                <Link href={`/promos/${post.Post_ID}`} className="hover:text-blue-600 transition-colors">
                  {post.Title}
                </Link>
              </h2>
              
              {/* Show a short snippet of the content */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.Content}
              </p>
              
              <Link 
                href={`/promos/${post.Post_ID}`} 
                className="inline-block text-blue-600 font-semibold hover:underline"
              >
                Read Full Details &rarr;
              </Link>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}