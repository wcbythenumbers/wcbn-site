import Link from 'next/link';
import { getRecaps, getVotes } from '../../../../lib/sheets';
import EntityTag from '../../../components/EntityTag';
import { formatDate } from '../../../../lib/format';
import styles from '../../recaps.module.css';

function splitLines(str) {
  if (!str) return [];
  return str
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

const OUTCOME_STYLES = {
  Passed: 'outcomePassed',
  Failed: 'outcomeFailed',
  Tabled: 'outcomeTabled',
};

export async function generateMetadata({ params }) {
  const { entity, date } = await params;
  const recaps = await getRecaps();
  const recap = recaps.find((r) => r.entity_slug === entity && r.meeting_date === date);

  if (!recap) {
    return { title: 'Recap Not Found — West Chester by the Numbers' };
  }

  return {
    title: `${recap.title} — West Chester by the Numbers`,
    description: recap.summary || undefined,
  };
}

export default async function RecapDetailPage({ params }) {
  const { entity, date } = await params;
  const [recaps, votes] = await Promise.all([getRecaps(), getVotes()]);

  const recap = recaps.find((r) => r.entity_slug === entity && r.meeting_date === date);
  const meetingVotes = votes.filter((v) => v.entity_slug === entity && v.meeting_date === date);

  if (!recap) {
    return (
      <main className={styles.main}>
        <div className={styles.notFoundWrap}>
          <p className={styles.notFoundText}>
            We couldn&apos;t find a published recap for this meeting.
          </p>
          <Link href="/recaps" className={styles.backLink}>← Back to all recaps</Link>
        </div>
      </main>
    );
  }

  const actionItems = splitLines(recap.action_items);

  return (
    <main className={styles.main}>
      <header className={styles.detailHero}>
        <div className={styles.heroInner}>
          <EntityTag id={entity} name={recap.entity} />
          <h1 className={styles.heading}>{recap.title}</h1>
          <p className={styles.detailMeta}>
            {recap.meeting_type} · {formatDate(recap.meeting_date)}
          </p>
          <div className={styles.linkRow}>
            {recap.agenda_url && (
              <a href={recap.agenda_url} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                Agenda ↗
              </a>
            )}
            {recap.minutes_url && (
              <a href={recap.minutes_url} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                Minutes ↗
              </a>
            )}
            {recap.video_url && (
              <a href={recap.video_url} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                Video Recording ↗
              </a>
            )}
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {recap.summary && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Summary</h2>
            <p className={styles.bodyText}>{recap.summary}</p>
          </section>
        )}

        {recap.key_discussion && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Key Discussion</h2>
            <p className={styles.bodyText}>{recap.key_discussion}</p>
          </section>
        )}

        {actionItems.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Action Items</h2>
            <ul className={styles.bulletList}>
              {actionItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Votes at This Meeting</h2>
          {meetingVotes.length === 0 ? (
            <p className={styles.emptyText}>No recorded votes for this meeting.</p>
          ) : (
            <ul className={styles.voteList}>
              {meetingVotes.map((v, i) => (
                <li key={`${v.resolution_id || v.resolution_title}-${i}`} className={styles.voteCard}>
                  <div className={styles.voteHeader}>
                    <div>
                      {v.resolution_id && <span className={styles.resolutionId}>{v.resolution_id}</span>}
                      <h3 className={styles.resolutionTitle}>{v.resolution_title}</h3>
                    </div>
                    {v.outcome && (
                      <span className={`${styles.outcomeTag} ${styles[OUTCOME_STYLES[v.outcome]] || ''}`}>
                        {v.outcome}
                      </span>
                    )}
                  </div>
                  {v.category && <p className={styles.voteCategory}>{v.category}</p>}
                  <div className={styles.voteBreakdown}>
                    <span><strong>Yes:</strong> {v.vote_yes || '—'}</span>
                    <span><strong>No:</strong> {v.vote_no || '—'}</span>
                    <span><strong>Abstain:</strong> {v.vote_abstain || '—'}</span>
                    <span><strong>Absent:</strong> {v.vote_absent || '—'}</span>
                  </div>
                  {v.notes && <p className={styles.voteNotes}>{v.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link href="/recaps" className={styles.backLink}>← Back to all recaps</Link>
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
