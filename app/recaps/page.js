import { getRecaps, getVotes } from '../../lib/sheets';
import RecapsClient from './RecapsClient';

export const metadata = {
  title: 'Meeting Recaps — West Chester by the Numbers',
  description:
    'Meeting recaps and key votes for every local government entity in the greater West Chester area.',
};

export default async function RecapsPage({ searchParams }) {
  const params = await searchParams;
  const initialEntity = typeof params?.entity === 'string' ? params.entity : null;
  const [recaps, votes] = await Promise.all([getRecaps(), getVotes()]);
  return <RecapsClient recaps={recaps} votes={votes} initialEntity={initialEntity} />;
}
