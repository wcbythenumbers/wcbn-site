import styles from '../about/about.module.css';

export const metadata = {
  title: 'Accessibility',
  description: 'Our accessibility goal, known limitations and how to report a problem.',
  alternates: { canonical: '/accessibility' },
};

export default function AccessibilityPage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heading}>Accessibility</h1>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <p>
            We want everyone to be able to use this site, including people who
            use screen readers, keyboard navigation, screen magnification or
            other assistive technology.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Our goal</h2>
          <p>
            We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1,
            Level AA. We test the site regularly with automated accessibility
            checks and fix problems we find.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Known limitations</h2>
          <p>
            Some charts may be hard to read with assistive technology. If you
            can&apos;t get the information you need from a chart, email us and
            we&apos;ll send you the figures in another format.
          </p>
          <p>
            Documents we link to, such as government budgets and meeting
            minutes, are published by others. We can&apos;t control whether
            they are accessible.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Report a problem</h2>
          <p>
            If something on this site is hard to use, email{' '}
            <a href="mailto:hello@westchesterbythenumbers.com" className={styles.link}>
              hello@westchesterbythenumbers.com
            </a>{' '}
            and tell us which page and what went wrong.
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
