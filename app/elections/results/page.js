import styles from '../../coming-soon.module.css';

export const metadata = {
  title: 'Election Results & Turnout — West Chester by the Numbers',
  description:
    'Results and turnout data for local elections in the greater West Chester area. Coming soon.',
};

export default function ResultsPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.label}>Elections</div>
          <h1 className={styles.heading}>Results &amp; Turnout</h1>
          <p className={styles.subtext}>
            Certified results and turnout data for local races across the
            Borough, the townships, WCASD, and county government — precinct by
            precinct, year over year. Coming soon.
          </p>
          <a href="/elections/voter-info" className={styles.btn}>
            Voter Information
          </a>
        </div>
      </section>
    </main>
  );
}
