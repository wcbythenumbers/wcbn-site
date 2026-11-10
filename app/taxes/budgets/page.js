import { getBudgets } from '../../../lib/sheets';
import BudgetsClient from './BudgetsClient';
import DataNote from '../../components/DataNote';

export const revalidate = 3600;

export const metadata = {
  title: 'Budgets — West Chester by the Numbers',
  description:
    'Adopted budgets for the governments that tax West Chester-area residents, with every fund and line item as printed in each budget.',
};

export default async function BudgetsPage() {
  const data = await getBudgets();
  return (
    <BudgetsClient
      {...data}
      dataNote={
        <DataNote>
          These are adopted budgets: amounts the governments planned to collect and spend, not what they actually collected or spent. Act 511 taxes are local taxes allowed under Pennsylvania&apos;s Local Tax Enabling Act, mainly the earned income tax, the real estate transfer tax and the local services tax. Each budget is shown in its own structure and with its own labels, so categories are not comparable from one government to another. Line items and fund totals are as printed in each budget document. For West Chester Borough, East Bradford and West Goshen, we grouped revenue lines into categories using the state chart of accounts or the line names; the line items themselves are unchanged. Changes from the prior year and shares of fund totals are calculated by WCBN. West Chester Area School District files only its General Fund budget with the state, and its budget year runs July through June. Thornbury Township (Chester Co.) has not published a detailed 2026 budget, so we show its 2024 actual revenue and spending as reported to the Pennsylvania Department of Community and Economic Development.
        </DataNote>
      }
    />
  );
}
