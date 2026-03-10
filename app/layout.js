export const metadata = {
  title: 'West Chester by the Numbers',
  description: 'Data-driven coverage of West Chester Borough and WCASD governance. Non-partisan. Clarity-first.',
  openGraph: {
    title: 'West Chester by the Numbers',
    description: 'Local government, by the numbers.',
    url: 'https://westchesterbythenumbers.com',
    siteName: 'West Chester by the Numbers',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
