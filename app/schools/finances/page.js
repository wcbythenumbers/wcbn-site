import { getBudget } from '../../../lib/sheets';
import FinancesClient from './FinancesClient';

export const revalidate = 3600;

export const metadata = {
  title: 'WCASD Finances — West Chester by the Numbers',
  description:
    'Audited spending, revenue, taxes, and debt for WCASD compared with similar Chester County districts and Pennsylvania.',
};

export default async function FinancesPage() {
  const rows = await getBudget();
  return <FinancesClient rows={rows} />;
}
