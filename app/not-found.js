import Link from 'next/link';
import styles from './coming-soon.module.css';
import nf from './not-found.module.css';

export const metadata = {
  title: 'Page not found',
  robots: { index: false },
};

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Taxes & Finances', href: '/taxes/explainer' },
  { label: 'Schools', href: '/schools/performance' },
  { label: 'Government', href: '/government/how-it-works' },
  { label: 'Meeting Recaps', href: '/recaps' },
  { label: 'Elections', href: '/elections/2027' },
];

export default function NotFound() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.label}>404</div>
          <h1 className={styles.heading}>Page not found</h1>
          <p className={styles.subtext}>
            The page you were looking for doesn&apos;t exist or has moved.
          </p>
          <nav aria-label="Site sections" className={nf.links}>
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={`${styles.btn} ${nf.link}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
