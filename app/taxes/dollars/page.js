import { getBudgetGovernments, getTaxDollars } from '../../../lib/sheets';
import TaxDollarsClient from './TaxDollarsClient';
import DataNote from '../../components/DataNote';

export const revalidate = 3600;

export const metadata = {
  title: 'Where Your Tax Dollars Go',
  description:
    'See what you pay in property taxes to Chester or Delaware County, your municipality, and the West Chester Area School District, and how each government budgets that money.',
  alternates: { canonical: '/taxes/dollars' },
};

export default async function TaxDollarsPage() {
  const [data, budgetGovIds] = await Promise.all([getTaxDollars(), getBudgetGovernments()]);
  return (
    <TaxDollarsClient
      {...data}
      budgetGovIds={budgetGovIds}
      dataNote={
        <DataNote>
          Amounts are based on each government&apos;s adopted budget, which is a spending plan, not actual spending. Your share of each tax is divided across that budget in proportion to budgeted spending, which we calculated. Tax amounts are estimates for illustration; your official tax bill is the authoritative amount.
        </DataNote>
      }
    />
  );
}
