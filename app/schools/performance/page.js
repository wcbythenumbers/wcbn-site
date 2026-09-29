import { getPeerPerformance, getSchoolPerformance } from '../../../lib/sheets';
import PerformanceClient from './PerformanceClient';

export const revalidate = 3600;

export const metadata = {
  title: 'School Performance — West Chester by the Numbers',
  description: 'PSSA and Keystone proficiency results for WCASD compared with Pennsylvania statewide.',
};

export default async function PerformancePage() {
  const [rows, peers] = await Promise.all([getSchoolPerformance(), getPeerPerformance()]);
  return <PerformanceClient rows={rows} peers={peers} />;
}
