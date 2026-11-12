import styles from '../elections.module.css';

export const metadata = {
  title: "Who's Running (2027)",
  description:
    'Local races in the greater West Chester area for the November 2027 municipal election.',
  alternates: { canonical: '/elections/2027' },
};

export default function Running2027Page() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Elections</div>
          <h1 className={styles.heading}>Who&apos;s Running (2027)</h1>
          <p className={styles.intro}>
            There were no local candidate races in the greater West Chester
            area in November 2026. The next local election is the November
            2027 municipal election.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <h2 className={styles.sectionHeading}>What&apos;s on the 2027 ballot</h2>
        <p className={styles.body}>
          Pennsylvania elects school board, municipal and county officials in
          odd-numbered years. In the WCASD area, the November 2027 ballot will
          include seats on the WCASD Board of School Directors, the township
          boards of supervisors, West Chester Borough Council, and county
          offices in Chester and Delaware Counties. Our{' '}
          <a href="/government/directory" className={styles.measureSourceLink}>
            Government Directory
          </a>{' '}
          lists each official&apos;s current term.
        </p>

        <h2 className={styles.sectionHeading}>Candidates</h2>
        <p className={styles.body}>
          Candidates file nomination petitions in early 2027, ahead of the May
          2027 primary. We will list every candidate for WCASD-area races here
          once filing closes.
        </p>

        <h2 className={styles.sectionHeading}>In the meantime</h2>
        <p className={styles.body}>
          Voter registration and mail-in ballot deadlines will apply to the May
          2027 primary and the November 2027 municipal election. Links for
          registering, checking your registration and requesting a mail-in
          ballot are on our voter information page.
        </p>
        <a href="/elections/voter-info" className={styles.linkBtn}>
          Voter Information →
        </a>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} West Chester by the Numbers</span>
          <div className={styles.footerLinks}>
            <a href="/about">About</a>
            <a href="/calendar">Calendar</a>
            <a href="/subscribe">Subscribe</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
