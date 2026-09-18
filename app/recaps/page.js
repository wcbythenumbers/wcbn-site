import { getRecaps, getVotes, getMeetings } from '../../lib/sheets';
import RecapsClient from './RecapsClient';

export const metadata = {
  title: 'Meeting Recaps — West Chester by the Numbers',
  description:
    'Meeting recaps and key votes for every local government entity in the greater West Chester area.',
};

export default async function RecapsPage({ searchParams }) {
  const params = await searchParams;
  const initialEntity = typeof params?.entity === 'string' ? params.entity : null;
  const [recaps, votes, meetings] = await Promise.all([getRecaps(), getVotes(), getMeetings()]);

  const pendingRecaps = meetings
    .filter((m) => m.recap_status === 'Recap Pending')
    .map((m) => ({
      entity_slug: m.entity_id,
      entity: m.entity,
      meeting_date: m.meeting_date,
      meeting_type: m.meeting_type,
    }));

  return (
    <RecapsClient
      recaps={recaps}
      votes={votes}
      pendingRecaps={pendingRecaps}
      initialEntity={initialEntity}
    />
  );
}
