import { getPeerPerformance, getSchoolPerformance } from '../../../lib/sheets';
import PerformanceClient from './PerformanceClient';
import DataNote from '../../components/DataNote';

export const revalidate = 3600;

export const metadata = {
  title: 'School Performance',
  description: 'PSSA and Keystone proficiency results for WCASD compared with Pennsylvania statewide.',
  alternates: { canonical: '/schools/performance' },
};

export default async function PerformancePage() {
  const [rows, peers] = await Promise.all([getSchoolPerformance(), getPeerPerformance()]);
  return (
    <PerformanceClient
      rows={rows}
      peers={peers}
      dataNote={
        <DataNote>
          Results are published by the Pennsylvania Department of Education. Results for groups too small to report are suppressed by PDE and shown as —.
        </DataNote>
      }
    />
  );
}
