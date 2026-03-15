import RatesClient from './RatesClient';

export const metadata = {
  title: 'Tax Rate Comparisons — West Chester by the Numbers',
  description:
    'Compare property tax millage rates, earned income tax rates, and local services tax across municipalities in the greater West Chester area.',
};

export default function TaxRatesPage() {
  return <RatesClient />;
}
