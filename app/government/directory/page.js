import DirectoryClient from './DirectoryClient';

export const metadata = {
  title: 'Government Directory',
  description:
    'A directory of current elected officials across every government entity serving the greater West Chester area — school board, borough, townships, and county government.',
  alternates: { canonical: '/government/directory' },
};

export default async function GovernmentDirectoryPage({ searchParams }) {
  const params = await searchParams;
  const initialEntity = typeof params?.entity === 'string' ? params.entity : null;

  return <DirectoryClient initialEntity={initialEntity} />;
}
