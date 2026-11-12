import { getRecaps } from '../lib/sheets';

export const revalidate = 3600;

const BASE_URL = 'https://www.westchesterbythenumbers.com';

// Public pages linked from the nav or footer. Leaves out redirects and
// "coming soon" pages (/subscribe, /articles, /elections/results).
const PAGES = [
  '/',
  '/taxes/explainer',
  '/taxes/rates',
  '/taxes/dollars',
  '/taxes/budgets',
  '/schools/finances',
  '/schools/enrollment',
  '/schools/performance',
  '/government/finances',
  '/government/how-it-works',
  '/government/directory',
  '/government/community',
  '/recaps',
  '/votes',
  '/elections/2027',
  '/elections/ballot',
  '/elections/voter-info',
  '/calendar',
  '/about',
  '/privacy',
];

export default async function sitemap() {
  const recaps = await getRecaps();
  const recapPaths = [
    ...new Set(
      recaps
        .filter((r) => r.entity_slug && r.meeting_date)
        .map((r) => `/recaps/${r.entity_slug}/${r.meeting_date}`)
    ),
  ];

  return [...PAGES, ...recapPaths].map((path) => ({ url: `${BASE_URL}${path}` }));
}
