import { getBudget } from '../../../lib/sheets';
import BudgetClient from './BudgetClient';

export const revalidate = 3600;

export const metadata = {
  title: 'WCASD Budget — West Chester by the Numbers',
  description:
    'Audited spending, revenue, taxes, and debt for WCASD compared with similar Chester County districts and Pennsylvania.',
};

export default async function BudgetPage() {
  const rows = await getBudget();
  return <BudgetClient rows={rows} />;
}
