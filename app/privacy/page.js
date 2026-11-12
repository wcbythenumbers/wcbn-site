import styles from '../about/about.module.css';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How West Chester by the Numbers handles information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heading}>Privacy Policy</h1>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <p>
            West Chester by the Numbers does not use cookies, analytics or
            advertising trackers, and does not sell or share personal
            information. If you dismiss the site&apos;s notice banner, your
            browser stores that choice on your own device. Our site is hosted
            by Vercel, which keeps standard server logs (such as IP addresses)
            for security and operations, and our fonts load from Google Fonts.
            If you email us, we use your message and address only to respond.
            Questions:{' '}
            <a href="mailto:hello@westchesterbythenumbers.com" className={styles.link}>
              hello@westchesterbythenumbers.com
            </a>
          </p>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} West Chester by the Numbers</span>
          <div className={styles.footerLinks}>
            <a href="/about">About</a>
            <a href="/articles">Articles</a>
            <a href="/subscribe">Subscribe</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/accessibility">Accessibility</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
