import { getMeetings } from '../../lib/sheets';
import CalendarClient from './CalendarClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Meeting Calendar',
  description: 'Upcoming public meetings for WCASD, West Chester Borough, and all member townships.',
  alternates: { canonical: '/calendar' },
};

export default async function CalendarPage() {
  const meetings = await getMeetings();
  return <CalendarClient meetings={meetings} />;
}
