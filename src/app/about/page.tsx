import { getSheetData } from '@/lib/google-sheets';

export const revalidate = 60;

export default async function AboutPage() {
  const settingsData = await getSheetData('Site_Settings');
  
  const getSetting = (key: string) => {
    const setting = settingsData.find((s) => s.Key === key);
    return setting?.Value || '';
  };

  const siteName = getSetting('SiteName') || '阿熹信用卡指南';
  const contactEmail = getSetting('ContactEmail') || 'hello@hkcardhub.com';
  const aboutUsText = getSetting('AboutUsText') || '阿熹致力於為香港人搜羅最抵、回贈最高的信用卡及理財產品。透過客觀的比較與詳細的評價，幫助你輕鬆選出最適合自己生活模式的信用卡，將日常簽賬轉化為豐富獎賞。';
  const facebookLink = getSetting('FacebookLink');

  return (
    <main className="min-h-screen bg-gray-50 py-16 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* 關於阿熹 */}
        <div className="mb-16 text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">關於 {siteName}</h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-gray-700 leading-relaxed text-left md:text-center">
            {aboutUsText}
          </p>
        </div>

        {/* 聯絡區塊 */}
        <div className="bg-[#0f172a] text-white p-10 rounded-3xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">聯絡阿熹</h2>
          <p className="text-slate-300 mb-8">
            如果你對特定信用卡有疑問，想了解最新迎新玩法，或者有任何合作提案，歡迎隨時聯絡阿熹！
          </p>
          
          {contactEmail && (
            <a 
              href={`mailto:${contactEmail}`}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all mb-4"
            >
              ✉️ 電郵聯絡：{contactEmail}
            </a>
          )}

          {facebookLink && (
            <div className="mt-4">
              <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                在 Facebook 上追蹤我們
              </a>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}