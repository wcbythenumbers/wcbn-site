import { getMunicipalFinances } from '../../../lib/sheets';
import MunicipalFinancesClient from './MunicipalFinancesClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Municipal Finances — West Chester by the Numbers',
  description:
    'Revenues, spending, debt, and fund balances for West Chester Borough and the townships in the West Chester Area School District, as reported to the Pennsylvania DCED.',
};

export default async function MunicipalFinancesPage() {
  const rows = await getMunicipalFinances();
  return <MunicipalFinancesClient rows={rows} />;
}
