import { getRecaps, getVotes } from '../../lib/sheets';
import VotesClient from './VotesClient';

export const metadata = {
  title: 'Voting Records — West Chester by the Numbers',
  description:
    'A record of every formal vote taken by elected boards and councils in the greater West Chester area.',
};

export default async function VotesPage({ searchParams }) {
  const params = await searchParams;
  const initialEntity = typeof params?.entity === 'string' ? params.entity : null;
  const [votes, recaps] = await Promise.all([getVotes(), getRecaps()]);
  const publishedRecapKeys = recaps.map((r) => `${r.entity_slug}|${r.meeting_date}`);

  return (
    <VotesClient
      votes={votes}
      publishedRecapKeys={publishedRecapKeys}
      initialEntity={initialEntity}
    />
  );
}
