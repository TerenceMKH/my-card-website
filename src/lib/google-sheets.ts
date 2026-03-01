import { google } from 'googleapis';

// 建立一個簡單的記憶體快取 (專門用來拯救開發模式的 API 限制)
const memoryCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 60000; // 60秒 (60000毫秒)

export async function getSheetData(range: string) {
  // 1. 檢查是否有尚未過期的快取
  const now = Date.now();
  const cached = memoryCache.get(range);
  
  // 如果快取存在且小於 60 秒，直接返回快取資料，不呼叫 Google API
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    // console.log(`[Cache Hit] 讀取本地快取: ${range}`);
    return cached.data;
  }

  // console.log(`[API Call] 正在向 Google Sheets 請求: ${range}`);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 2. Fetch the data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range, 
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // 3. 轉換資料格式
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      let rowData: { [key: string]: string } = {};
      headers.forEach((header: string, index: number) => {
        rowData[header] = row[index] || ''; 
      });
      return rowData;
    });

    // 4. 將新抓取的資料存入快取，重置計時器
    memoryCache.set(range, { data, timestamp: now });

    return data;

  } catch (error) {
    console.error(`Error fetching Google Sheet data for [${range}]:`, error);
    return [];
  }
}