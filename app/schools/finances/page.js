import { getBudget } from '../../../lib/sheets';
import FinancesClient from './FinancesClient';
import DataNote from '../../components/DataNote';

export const revalidate = 3600;

export const metadata = {
  title: 'WCASD Financials',
  description:
    'Audited spending, revenue, taxes, and debt for WCASD compared with similar Chester County districts and Pennsylvania.',
  alternates: { canonical: '/schools/finances' },
};

export default async function FinancesPage() {
  const rows = await getBudget();
  return (
    <FinancesClient
      rows={rows}
      dataNote={
        <DataNote>
          Figures are audited actual revenues and spending reported by each school district to the Pennsylvania Department of Education (Annual Financial Reports), general fund unless noted. Figures labeled calculated were computed by us from those files.
        </DataNote>
      }
    />
  );
}
