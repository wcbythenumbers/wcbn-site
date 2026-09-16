import DirectoryClient from './DirectoryClient';

export const metadata = {
  title: 'Government Directory — West Chester by the Numbers',
  description:
    'A directory of current elected officials across every government entity serving the greater West Chester area — school board, borough, townships, and county government.',
};

export default function GovernmentDirectoryPage() {
  return <DirectoryClient />;
}
