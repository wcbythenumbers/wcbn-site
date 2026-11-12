import { getTaxRates } from '../../../lib/sheets';
import RatesClient from './RatesClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Tax Rate Comparisons',
  description:
    'Compare property tax millage rates, earned income tax rates, and local services tax across municipalities in the greater West Chester area.',
  alternates: { canonical: '/taxes/rates' },
};

export default async function TaxRatesPage() {
  const rates = await getTaxRates();
  return <RatesClient rates={rates} />;
}
