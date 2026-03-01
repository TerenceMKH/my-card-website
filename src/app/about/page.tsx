import { getSheetData } from '@/lib/google-sheets';

export default async function AboutPage() {
  // Fetch site settings
  const settingsData = await getSheetData('Site_Settings');
  
  // Helper function to easily grab values by their Key
  const getSetting = (key: string) => {
    const setting = settingsData.find((s) => s.Key === key);
    return setting?.Value || '';
  };

  const siteName = getSetting('SiteName') || 'HK Card Hub';
  const contactEmail = getSetting('ContactEmail');
  // You can add these keys to your Google Sheet later!
  const aboutUsText = getSetting('AboutUsText') || 'We are dedicated to helping you find the best credit card deals, welcome offers, and cash rebates in Hong Kong. Our mission is to simplify personal finance.';
  const facebookLink = getSetting('FacebookLink');

  return (
    <main className="min-h-screen bg-white py-16 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* About Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About {siteName}</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-600 leading-relaxed">
            {aboutUsText}
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have a question about a specific card, or want to partner with us? We'd love to hear from you.
          </p>
          
          {contactEmail && (
            <a 
              href={`mailto:${contactEmail}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all mb-4"
            >
              Email Us: {contactEmail}
            </a>
          )}

          {facebookLink && (
            <div className="mt-4">
              <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                Follow us on Facebook
              </a>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}