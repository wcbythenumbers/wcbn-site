import BallotClient from './BallotClient';

export const metadata = {
  title: "What's on the Ballot — West Chester by the Numbers",
  description:
    'Ballot measures and referendums affecting residents in the greater West Chester area.',
};

export default function BallotPage() {
  return <BallotClient />;
}
