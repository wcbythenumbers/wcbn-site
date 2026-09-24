import { getSchoolPerformance } from '../../../lib/sheets';
import PerformanceClient from './PerformanceClient';

export const metadata = {
  title: 'School Performance — West Chester by the Numbers',
  description: 'PSSA and Keystone proficiency results for WCASD compared with Pennsylvania statewide.',
};

export default async function PerformancePage() {
  const rows = await getSchoolPerformance();
  return <PerformanceClient rows={rows} />;
}
