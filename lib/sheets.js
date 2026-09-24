import { google } from 'googleapis';
import { resolveEntityId } from './entities';

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) return null;

  return new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// Fetches a sheet's rows and converts them into objects keyed by the
// lowercased, underscored header row (e.g. "Meeting Date" -> meeting_date).
async function getSheetRows(sheetName, spreadsheetId = process.env.GOOGLE_SHEET_ID) {
  const auth = getAuth();
  if (!auth || !spreadsheetId) return [];

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return [];

    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.map((h) => String(h).trim().toLowerCase().replace(/\s+/g, '_'));

    return dataRows
      .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
      .map((row) => {
        const record = {};
        headers.forEach((key, i) => {
          record[key] = row[i] !== undefined ? String(row[i]).trim() : '';
        });
        return record;
      });
  } catch (err) {
    console.error(`Failed to load "${sheetName}" sheet:`, err.message);
    return [];
  }
}

export async function getRecaps() {
  const rows = await getSheetRows('Recaps');
  return rows.filter((row) => row.status === 'Published');
}

export async function getVotes() {
  return getSheetRows('Votes');
}

// entity | meeting_date | meeting_type | meeting_time | location |
// more_info_url | recap_status | recap_url
export async function getMeetings() {
  const rows = await getSheetRows('Meeting Schedule');
  return rows.map((row) => ({
    ...row,
    entity_id: resolveEntityId(row.entity),
  }));
}

export async function getSchoolPerformance() {
  return getSheetRows('Assessments',process.env.GOOGLE_PERFORMANCE_SHEET_ID);
}
