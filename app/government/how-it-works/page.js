import HowItWorksClient from './HowItWorksClient';

export const metadata = {
  title: 'How Local Government Works',
  description:
    'A civic guide to local government in the greater West Chester area: county, municipal, school district, and judicial bodies — how each one works, who sits on it, and how members are chosen.',
  alternates: { canonical: '/government/how-it-works' },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
