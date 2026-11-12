import Link from 'next/link';
import { getRecaps, getVotes } from '../../../../lib/sheets';
import EntityTag from '../../../components/EntityTag';
import { formatDate } from '../../../../lib/format';
import { recapAnchorId } from '../../../../lib/slug';
import styles from '../../recaps.module.css';

function splitLines(str) {
  if (!str) return [];
  return str
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

const GOVERNING_BOARD = 'Governing board';

// All published recaps for one government on one date: governing board first,
// then by meeting type.
function findRecaps(recaps, entity, date) {
  return recaps
    .filter((r) => r.entity_slug === entity && r.meeting_date === date)
    .sort((a, b) => {
      const ga = a.body_type === GOVERNING_BOARD ? 0 : 1;
      const gb = b.body_type === GOVERNING_BOARD ? 0 : 1;
      if (ga !== gb) return ga - gb;
      return String(a.meeting_type || '').localeCompare(String(b.meeting_type || ''));
    });
}

function RecapLinks({ recap, light = false }) {
  return (
    <>
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
      {recap.source && (
        <p className={`${styles.sourceNote} ${light ? styles.sourceNoteLight : ''}`}>{recap.source}</p>
      )}
    </>
  );
}

// Summary, Key Discussion and Action Items for one recap. HeadingTag is h2 on
// a single-meeting page and h3 inside a meeting's section.
function RecapBody({ recap, HeadingTag = 'h2' }) {
  const keyDiscussion = splitLines(recap.key_discussion);
  return (
    <main className={styles.main}>
      <header className={styles.detailHero}>
        <div className={styles.heroInner}>
          <EntityTag id={entity} name={recap.entity} />
          {isMulti ? (
            <h1 className={styles.heading}>Meetings on {formatDate(recap.meeting_date)}</h1>
          ) : (
            <>
              <h1 className={styles.heading}>{recap.title}</h1>
              <p className={styles.detailMeta}>
                {recap.meeting_type} · {formatDate(recap.meeting_date)}
              </p>
              <RecapLinks recap={recap} light />
            </>
          )}
        </div>
      </header>

      <div className={styles.content}>
        {isMulti ? (
          dayRecaps.map((r, i) => (
            <section key={i} id={recapAnchorId(r.meeting_type)} className={styles.meetingSection}>
              <h2 className={styles.meetingTitle}>{r.title}</h2>
              {r.meeting_type && <p className={styles.meetingTypeText}>{r.meeting_type}</p>}
              <div className={styles.meetingLinks}>
                <RecapLinks recap={r} />
              </div>
              <RecapBody recap={r} HeadingTag="h3" />
            </section>
          ))
        ) : (
          <RecapBody recap={recap} />
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
          <span>© {new Date().getFullYear()} West Chester by the Numbers</span>
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
