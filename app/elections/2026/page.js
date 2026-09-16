import styles from '../elections.module.css';

export const metadata = {
  title: "Who's Running (2026) — West Chester by the Numbers",
  description:
    'Local candidate races in the greater West Chester area for the November 2026 election.',
};

export default function Running2026Page() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Elections</div>
          <h1 className={styles.heading}>Who&apos;s Running (2026)</h1>
          <p className={styles.intro}>
            There are no local candidate races in the greater West Chester area
            for November 2026. Check back in 2027 for a full guide to local
            races including school board, township supervisors, and county
            commissioner elections.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <h2 className={styles.sectionHeading}>In the meantime</h2>
        <p className={styles.body}>
          Voter registration and mail-in ballot deadlines still apply for the
          November 2026 election. Key dates and links are on our voter
          information page.
        </p>
        <a href="/elections/voter-info" className={styles.linkBtn}>
          Voter Information →
        </a>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© 2025 West Chester by the Numbers</span>
          <div className={styles.footerLinks}>
            <a href="/about">About</a>
            <a href="/calendar">Calendar</a>
            <a href="/subscribe">Subscribe</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
