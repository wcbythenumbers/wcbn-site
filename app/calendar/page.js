import { getMeetings } from '../../lib/sheets';
import CalendarClient from './CalendarClient';

export const metadata = {
  title: 'Meeting Calendar — West Chester by the Numbers',
  description: 'Upcoming public meetings for WCASD, West Chester Borough, and all member townships.',
};

export default async function CalendarPage() {
  const meetings = await getMeetings();
  return <CalendarClient meetings={meetings} />;
}
