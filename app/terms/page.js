import styles from '../about/about.module.css';

export const metadata = {
  title: 'Terms of Use',
  description: 'The terms for using West Chester by the Numbers.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heading}>Terms of Use</h1>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Using this site</h2>
          <p>
            By using westchesterbythenumbers.com, you agree to these terms. Our{' '}
            <a href="/privacy" className={styles.link}>Privacy Policy</a> explains what
            information we collect.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Information only</h2>
          <p>
            Content on this site is for general information. It is not legal,
            financial, tax or investment advice. Check with the official source
            or a qualified professional before making decisions based on it.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Accuracy</h2>
          <p>
            We take our numbers from official sources and work to report them
            accurately, but we can&apos;t guarantee that everything on the site
            is complete, current or free of errors. The site is provided
            &ldquo;as is,&rdquo; without warranties of any kind. If you spot an
            error, please email{' '}
            <a href="mailto:hello@westchesterbythenumbers.com" className={styles.link}>
              hello@westchesterbythenumbers.com
            </a>
            . Corrections are handled as described on our{' '}
            <a href="/about" className={styles.link}>About page</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Meeting recaps</h2>
          <p>
            Our meeting recaps are summaries we prepare. They are not official
            records. A meeting&apos;s official minutes and recording are the
            record of what happened.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Reusing our work</h2>
          <p>
            You may share, quote and republish our content and calculated
            figures with credit to &ldquo;West Chester by the Numbers&rdquo; and
            a link to the page. Public data we report belongs to its original
            source. Please don&apos;t present our work as your own or suggest
            that we endorse you, your organization or a position.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Links to other sites</h2>
          <p>
            We link to government websites and other sites we don&apos;t
            control. We aren&apos;t responsible for their content or
            availability.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, West Chester by the Numbers
            is not liable for any loss or damage arising from your use of this
            site or reliance on its content.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Changes</h2>
          <p>We may update these terms. The version posted on this page applies.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Governing law</h2>
          <p>These terms are governed by the laws of Pennsylvania.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Contact</h2>
          <p>
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
