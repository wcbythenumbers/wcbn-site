import styles from '../elections.module.css';

export const metadata = {
  title: 'Voter Information — West Chester by the Numbers',
  description:
    'Where to register, request a mail-in ballot, and find election administration information for the greater West Chester area.',
};

export default function VoterInfoPage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Elections</div>
          <h1 className={styles.heading}>Voter Information</h1>
          <p className={styles.intro}>
            Where to register, check your registration status, request a
            mail-in ballot, and find your polling place.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <h2 className={styles.sectionHeading}>Where to register and vote</h2>
        <p className={styles.body}>
          Voter registration, mail-in ballots, polling places, and all other
          election administration for local races in the greater West Chester
          area are handled by the county, not by the Borough, townships, or
          WCASD.
        </p>
        <p className={styles.body}>
          Most of the area falls in Chester County. Chester County Voter
          Services handles registration, mail-in ballot requests, polling
          place lookup, and sample ballots.
        </p>
        <a
          href="https://www.chesco.org/156/Voter-Services"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
        >
          Chester County Voter Services ↗
        </a>

        <div className={styles.countyNote}>
          <p className={styles.countyNoteLabel}>Delaware County residents</p>
          <p className={styles.countyNoteBody}>
            If you live in Thornbury Township (Delaware Co.), your election
            administration is handled by Delaware County, not Chester County.
          </p>
          <a
            href="https://www.delcopa.gov/elections/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkBtn}
          >
            Delaware County Elections ↗
          </a>
        </div>
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
