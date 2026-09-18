import { slugifyName } from './slug';

const VOTE_COLUMNS = [
  { key: 'vote_yes', choice: 'Yes' },
  { key: 'vote_no', choice: 'No' },
  { key: 'vote_abstain', choice: 'Abstain' },
  { key: 'vote_absent', choice: 'Absent' },
];

export function parseNames(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// "7-0" style yes-no tally for a single vote row.
export function voteTally(vote) {
  return `${parseNames(vote.vote_yes).length}-${parseNames(vote.vote_no).length}`;
}

// Finds every vote a given member (matched by slugified name) participated
// in, along with how they voted on each one.
export function votesForMember(votes, memberSlug) {
  const results = [];
  let matchedName = null;

  for (const vote of votes) {
    for (const { key, choice } of VOTE_COLUMNS) {
      const names = parseNames(vote[key]);
      const match = names.find((name) => slugifyName(name) === memberSlug);
      if (match) {
        matchedName = matchedName || match;
        results.push({ ...vote, choice });
        break;
      }
    }
  }

  return { matchedName, votes: results };
}
