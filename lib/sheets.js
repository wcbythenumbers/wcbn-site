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
async function getSheetRows(sheetName, sheetIdEnvVar = 'GOOGLE_SHEET_ID') {
  const spreadsheetId = process.env[sheetIdEnvVar];
  const auth = getAuth();
  if (!auth || !spreadsheetId) {
    const missing = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', sheetIdEnvVar].filter(
      (name) => !process.env[name]
    );
    console.error(`Sheets: missing env vars: ${missing.join(', ')}`);
    return [];
  }

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
  return getSheetRows('Assessments', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// year | exam | subject | district | pct_prof_adv | n_scored (All Students only)
export async function getPeerPerformance() {
  return getSheetRows('Peers', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// year | district | enrollment
export async function getEnrollment() {
  return getSheetRows('Enrollment', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// year | district | category ("Program" or "Race/ethnicity") | measure | pct
export async function getDemographics() {
  return getSheetRows('Demographics', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// year | district | professional_staff | classroom_teachers |
// teacher_avg_years_experience | students_per_teacher_calc
export async function getStaffing() {
  return getSheetRows('Staffing', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// section | measure | district | basis | note | <one column per school year>
export async function getBudget() {
  return getSheetRows('Budget', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// section | measure | municipality | basis | note | <one column per calendar year>
export async function getMunicipalFinances() {
  return getSheetRows('Municipal', 'GOOGLE_PERFORMANCE_SHEET_ID');
}

// "1,234.5", "$-12", " 3 " -> number; blank or non-numeric -> 0.
function toNumber(value) {
  const n = Number(String(value ?? '').replace(/[$,]/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function withNumbers(rows, keys) {
  return rows.map((row) => {
    const out = { ...row };
    keys.forEach((key) => {
      out[key] = toNumber(row[key]);
    });
    return out;
  });
}

// TaxRates tab only, for the Tax Rate Comparisons page.
export async function getTaxRates() {
  const rows = await getSheetRows('TaxRates', 'GOOGLE_PERFORMANCE_SHEET_ID');
  return withNumbers(rows, ['rate']);
}

// TaxRates:    municipality | county | tax_type | taxing_body_type | body | government | component |
//              rate | rate_unit | tax_year  (tax_type "Property" = mills, "Earned income" = percent)
// TaxBudget:   body | level1 | level2 | level3 | amount | note
// TaxBodies:   body | government | fund | budget_year | source | source_url | detail_note | budget_total
// TaxSettings: setting | county | value | note
export async function getTaxDollars() {
  const id = 'GOOGLE_PERFORMANCE_SHEET_ID';
  const [rates, budget, bodies, settings] = await Promise.all([
    getTaxRates(),
    getSheetRows('TaxBudget', id),
    getSheetRows('TaxBodies', id),
    getSheetRows('TaxSettings', id),
  ]);
  return {
    rates,
    budget: withNumbers(budget, ['amount']),
    bodies: withNumbers(bodies, ['budget_total']),
    settings: withNumbers(settings, ['value']),
  };
}
