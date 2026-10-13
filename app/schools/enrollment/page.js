import { getDemographics, getEnrollment, getStaffing } from '../../../lib/sheets';
import EnrollmentClient from './EnrollmentClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Enrollment & Staffing — West Chester by the Numbers',
  description:
    'Enrollment, student demographics, and staffing for WCASD compared with similar Chester County districts and Pennsylvania statewide.',
};

export default async function EnrollmentPage() {
  const [enrollment, demographics, staffing] = await Promise.all([
    getEnrollment(),
    getDemographics(),
    getStaffing(),
  ]);
  return <EnrollmentClient enrollment={enrollment} demographics={demographics} staffing={staffing} />;
}
