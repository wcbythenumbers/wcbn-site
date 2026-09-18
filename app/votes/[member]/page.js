import Link from 'next/link';
import { getVotes } from '../../../lib/sheets';
import { votesForMember } from '../../../lib/votes';
import { formatDate } from '../../../lib/format';
import styles from '../votes.module.css';

export async function generateMetadata({ params }) {
  const { member } = await params;
  const votes = await getVotes();
  const { matchedName } = votesForMember(votes, member);

  return {
    title: `${matchedName || 'Voting Record'} — West Chester by the Numbers`,
  };
}

export default async function MemberVotesPage({ params }) {
  const { member } = await params;
  const votes = await getVotes();
  const { matchedName, votes: memberVotes } = votesForMember(votes, member);

  const sorted = [...memberVotes].sort((a, b) => (a.meeting_date < b.meeting_date ? 1 : -1));

  const total = sorted.length;
  const counts = { Yes: 0, No: 0, Abstain: 0, Absent: 0 };
  sorted.forEach((v) => {
    counts[v.choice] = (counts[v.choice] || 0) + 1;
  });
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <main className={styles.main}>
      <header className={styles.memberHero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Voting Record</div>
          <h1 className={styles.memberName}>{matchedName || 'Unknown Member'}</h1>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{total}</div>
              <div className={styles.statLabel}>Total Votes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{pct(counts.Yes)}%</div>
              <div className={styles.statLabel}>Yes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{pct(counts.No)}%</div>
              <div className={styles.statLabel}>No</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{pct(counts.Abstain)}%</div>
              <div className={styles.statLabel}>Abstain</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{pct(counts.Absent)}%</div>
              <div className={styles.statLabel}>Absent</div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {sorted.length === 0 ? (
          <p className={styles.emptyText}>
            No voting record found for this member yet.
          </p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Entity</th>
                  <th>Resolution</th>
                  <th>Vote</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((v, i) => (
                  <tr key={`${v.resolution_id || v.resolution_title}-${i}`}>
                    <td className={styles.dateCell}>{formatDate(v.meeting_date)}</td>
                    <td>{v.entity}</td>
                    <td>{v.resolution_title}</td>
                    <td><span className={styles.choiceTag}>{v.choice}</span></td>
                    <td>{v.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link href="/government/directory" className={styles.backLink}>
          ← Back to Government Directory
        </Link>
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
