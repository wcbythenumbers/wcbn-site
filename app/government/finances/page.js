import { getMunicipalFinances } from '../../../lib/sheets';
import MunicipalFinancesClient from './MunicipalFinancesClient';
import DataNote from '../../components/DataNote';

export const revalidate = 3600;

export const metadata = {
  title: 'Municipal Finances — West Chester by the Numbers',
  description:
    'Revenues, spending, debt, and fund balances for West Chester Borough and the townships in the West Chester Area School District, as reported to the Pennsylvania DCED.',
};

export default async function MunicipalFinancesPage() {
  const rows = await getMunicipalFinances();
  return (
    <MunicipalFinancesClient
      rows={rows}
      dataNote={
        <DataNote>
          Figures are as reported by each municipality to the Pennsylvania Department of Community and Economic Development in its Annual Audit and Financial Report. They cover all of a municipality&apos;s funds. Groupings and figures labeled calculated are ones we computed from those reports.
        </DataNote>
      }
    />
  );
}
