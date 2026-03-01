import { google } from 'googleapis';

export async function getSheetData(range: string) {
  try {
    // 1. Authenticate using the environment variables
    const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      // We must replace escaped newline characters for the key to work properly
      (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      target
    );

    const sheets = google.sheets({ version: 'v4', auth: jwt });

    // 2. Fetch the data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range, 
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // 3. Convert array of arrays into array of objects (using the first row as headers)
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      let rowData: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || ''; // Handle empty cells
      });
      return rowData;
    });

    return data;

  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    return [];
  }
}