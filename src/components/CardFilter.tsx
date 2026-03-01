'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// 定義可供動態篩選的欄位
const FILTER_FIELDS = [
  { key: 'Bank_Name', label: '發卡銀行' },
  { key: 'Card_Network', label: '信用卡網絡' },
  { key: 'Card_Tier', label: '信用卡級別' },
  { key: 'Annual_Fee_Waiver', label: '年費政策' }
];

export default function CardFilter({ cards, categories, btnBg, btnText }: any) {
  const [fixedCategory, setFixedCategory] = useState('');
  // 動態篩選器狀態：最多3個。每個篩選器包含 field (例如 Bank_Name) 和 value (例如 渣打銀行)
  const [dynamicFilters, setDynamicFilters] = useState([{ id: Date.now(), field: '', value: '' }]);

  // 新增篩選器
  const addFilter = () => {
    if (dynamicFilters.length < 3) {
      setDynamicFilters([...dynamicFilters, { id: Date.now(), field: '', value: '' }]);
    }
  };

  // 移除篩選器
  const removeFilter = (id: number) => {
    setDynamicFilters(dynamicFilters.filter(f => f.id !== id));
  };

  // 更新篩選器欄位或數值
  const updateFilter = (id: number, key: 'field' | 'value', val: string) => {
    setDynamicFilters(dynamicFilters.map(f => {
      if (f.id === id) {
        // 如果更改了欄位(field)，必須清空數值(value)
        return key === 'field' ? { ...f, field: val, value: '' } : { ...f, [key]: val };
      }
      return f;
    }));
  };

  // 根據選擇的欄位，動態獲取 Google Sheets 裡面唯一存在的值 (例如 HSBC, 渣打)
  const getUniqueValues = (fieldKey: string) => {
    if (!fieldKey) return [];
    const values = cards.map((c: any) => c[fieldKey]).filter(Boolean);
    return Array.from(new Set(values)) as string[];
  };

  // 實時過濾邏輯
  const filteredCards = useMemo(() => {
    return cards.filter((card: any) => {
      // 1. 固定分類過濾
      if (fixedCategory) {
        const tags = card.Categories_Tags?.toLowerCase() || '';
        if (!tags.includes(fixedCategory.toLowerCase())) return false;
      }
      // 2. 動態過濾器過濾
      for (const filter of dynamicFilters) {
        if (filter.field && filter.value) {
          if (card[filter.field] !== filter.value) return false;
        }
      }
      return true;
    });
  }, [cards, fixedCategory, dynamicFilters]);

  return (
    <div className="max-w-6xl mx-auto px-6 mt-8">
      
      {/* 篩選控制面板 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          篩選信用卡
        </h2>
        
        <div className="space-y-4">
          {/* 固定分類篩選 */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="font-bold text-gray-700 w-full md:w-32">固定分類：</label>
            <select 
              value={fixedCategory} 
              onChange={(e) => setFixedCategory(e.target.value)}
              className="flex-1 w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="">所有分類</option>
              {categories.map((cat: any) => (
                <option key={cat.Category_ID} value={cat.Category_ID}>{cat.Page_Title}</option>
              ))}
            </select>
          </div>

          {/* 動態篩選器 (最多 3 個) */}
          <div className="space-y-3">
            {dynamicFilters.map((filter, index) => (
              <div key={filter.id} className="flex flex-col md:flex-row gap-3 items-center">
                <label className="font-bold text-gray-700 w-full md:w-32">條件 {index + 1}：</label>
                
                {/* 選擇欄位 (Bank, Network, etc) */}
                <select 
                  value={filter.field} 
                  onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                  className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">選擇篩選類別...</option>
                  {FILTER_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>

                {/* 根據欄位顯示對應的選項值 */}
                <select 
                  value={filter.value} 
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                  disabled={!filter.field}
                  className="w-full md:flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{filter.field ? '選擇數值...' : '請先選擇類別'}</option>
                  {getUniqueValues(filter.field).map((val: string) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>

                {/* 移除按鈕 */}
                {dynamicFilters.length > 1 && (
                  <button onClick={() => removeFilter(filter.id)} className="w-full md:w-auto p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    ✖ 移除
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 新增篩選按鈕 */}
          {dynamicFilters.length < 3 && (
            <button onClick={addFilter} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2">
              <span>+</span> 新增進階篩選條件 (最多3個)
            </button>
          )}
        </div>
      </div>

      {/* 搜尋結果統計 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          找到 <span className="text-blue-600">{filteredCards.length}</span> 張符合條件的信用卡
        </h3>
      </div>

      {/* 信用卡列表 */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCards.map((card: any) => (
            <div key={card.Card_ID} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow p-6 gap-6">
              
              <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-center justify-center">
                <img src={card.Image_URL || 'https://via.placeholder.com/300x190'} alt={card.Card_Name_TC} className="w-full max-w-[200px] rounded-xl shadow-sm border border-gray-100 mb-3" />
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                  {card.Bank_Name}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.Card_Name_TC}</h3>
                <p className="text-sm text-gray-600 mb-4">{card.Summary_Review}</p>
                
                {card.Welcome_Offer_Main && (
                  <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm font-medium border border-orange-100 mb-4 inline-block w-full">
                    <span className="font-bold mr-2">🎁 迎新優惠:</span> {card.Welcome_Offer_Main}
                  </div>
                )}

                <div className="flex gap-4 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                  <div><span className="text-gray-500 mr-2">本地:</span><span className="font-bold text-gray-900">{card.Rate_Local || '--'}</span></div>
                  <div className="w-px bg-gray-300"></div>
                  <div><span className="text-gray-500 mr-2">外幣:</span><span className="font-bold text-gray-900">{card.Rate_Foreign || '--'}</span></div>
                </div>
              </div>

              <div className="w-full md:w-48 flex-shrink-0 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                <Link href={`/cards/${card.Card_ID}`} className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors text-sm">詳細評價</Link>
                {card.Apply_Link && (
                  <a href={card.Apply_Link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: btnBg, color: btnText }} className="w-full text-center font-bold py-3 px-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity text-sm">立即申請</a>
                )}
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg font-medium">找不到符合條件的信用卡。</p>
          <button onClick={() => {setFixedCategory(''); setDynamicFilters([{ id: Date.now(), field: '', value: '' }]);}} className="mt-4 text-blue-600 hover:underline">清除所有篩選條件</button>
        </div>
      )}
    </div>
  );
}