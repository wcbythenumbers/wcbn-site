import './globals.css';
import { playfairDisplay, sourceSerif4, ibmPlexMono } from './fonts';
import Nav from './components/Nav';
import DisclaimerBanner from './components/DisclaimerBanner';

const SITE_DESCRIPTION =
  'Facts and figures on local government, taxes, schools and public meetings in the West Chester Area School District communities.';

export const metadata = {
  metadataBase: new URL('https://www.westchesterbythenumbers.com'),
  title: {
    default: 'West Chester by the Numbers',
    template: '%s | West Chester by the Numbers',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: 'West Chester by the Numbers',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSerif4.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <Nav />
        {children}
        <DisclaimerBanner />
      </body>
    </html>
  );
}
