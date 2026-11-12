import BallotClient from './BallotClient';

export const metadata = {
  title: "What's on the Ballot",
  description:
    'Ballot measures and referendums affecting residents in the greater West Chester area.',
  alternates: { canonical: '/elections/ballot' },
};

export default function BallotPage() {
  return <BallotClient />;
}
