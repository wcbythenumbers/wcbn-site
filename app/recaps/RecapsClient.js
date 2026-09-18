'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import MunicipalityFilter from '../components/MunicipalityFilter';
import EntityTag from '../components/EntityTag';
import { formatDate, isWithinPastYear } from '../../lib/format';
import { isValidMunicipalityId } from '../../lib/entities';
import styles from './recaps.module.css';

export default function RecapsClient({ recaps, votes, pendingRecaps = [], initialEntity }) {
  const [selected, setSelected] = useState(() =>
    isValidMunicipalityId(initialEntity) ? [initialEntity] : []
  );
  const isAllActive = selected.length === 0;

  const matchesFilter = (entitySlug) => isAllActive || selected.includes(entitySlug);

  const openMatters = useMemo(
    () =>
      votes
        .filter((v) => v.status === 'Ongoing' && matchesFilter(v.entity_slug))
        .sort((a, b) => (a.meeting_date < b.meeting_date ? 1 : -1)),
    [votes, selected]
  );

  const keyDecisions = useMemo(
    () =>
      votes
        .filter(
          (v) => v.status === 'Resolved' && isWithinPastYear(v.meeting_date) && matchesFilter(v.entity_slug)
        )
        .sort((a, b) => (a.meeting_date < b.meeting_date ? 1 : -1)),
    [votes, selected]
  );

  const visibleRecaps = useMemo(() => {
    const published = recaps.map((r) => ({ ...r, pending: false }));
    const pending = pendingRecaps.map((r) => ({ ...r, pending: true }));
    return [...published, ...pending]
      .filter((r) => matchesFilter(r.entity_slug))
      .sort((a, b) => (a.meeting_date < b.meeting_date ? 1 : -1));
  }, [recaps, pendingRecaps, selected]);

  const hasSummaryData = openMatters.length > 0 || keyDecisions.length > 0;

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Government</div>
          <h1 className={styles.heading}>Meeting Recaps</h1>
          <p className={styles.intro}>
            Meeting recaps covering all local government entities in the
            greater West Chester area. Each recap summarizes what happened,
            key votes taken, and what to watch going forward.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <MunicipalityFilter selected={selected} onChange={setSelected} />

        <section className={styles.summaryGrid}>
          <div>
            <h2 className={styles.summaryColHeading}>Open Matters</h2>
            {openMatters.length === 0 ? (
              !hasSummaryData ? (
                <p className={styles.emptyText}>Recaps and votes will appear here as they are published.</p>
              ) : (
                <p className={styles.emptyText}>No open matters right now.</p>
              )
            ) : (
              <ul className={styles.summaryList}>
                {openMatters.map((v, i) => (
                  <li key={`${v.resolution_id || v.resolution_title}-${i}`} className={styles.summaryItem}>
                    <div className={styles.summaryItemTitle}>{v.resolution_title}</div>
                    <div className={styles.summaryItemMeta}>
                      <EntityTag id={v.entity_slug} name={v.entity} />
                      <span>Last discussed {formatDate(v.meeting_date)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className={styles.summaryColHeading}>Key Decisions (Past 12 Months)</h2>
            {keyDecisions.length === 0 ? (
              !hasSummaryData ? (
                <p className={styles.emptyText}>Recaps and votes will appear here as they are published.</p>
              ) : (
                <p className={styles.emptyText}>No key decisions in the past 12 months.</p>
              )
            ) : (
              <ul className={styles.summaryList}>
                {keyDecisions.map((v, i) => (
                  <li key={`${v.resolution_id || v.resolution_title}-${i}`} className={styles.summaryItem}>
                    <div className={styles.summaryItemTitle}>{v.resolution_title}</div>
                    <div className={styles.summaryItemMeta}>
                      <EntityTag id={v.entity_slug} name={v.entity} />
                      <span>{v.outcome}</span>
                      <span>{formatDate(v.meeting_date)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <h2 className={styles.listHeading}>All Recaps</h2>
        {visibleRecaps.length === 0 ? (
          <p className={styles.emptyText}>No recaps published yet. Check back soon.</p>
        ) : (
          <ul className={styles.recapList}>
            {visibleRecaps.map((r, i) => (
              <li key={`${r.entity_slug}-${r.meeting_date}-${i}`} className={styles.recapEntry}>
                <div className={styles.recapMeta}>
                  <EntityTag id={r.entity_slug} name={r.entity} />
                  <span className={styles.recapDateTime}>{formatDate(r.meeting_date)}</span>
                  <span className={styles.recapType}>{r.meeting_type}</span>
                </div>
                {r.pending ? (
                  <p className={styles.recapPendingText}>Recap coming soon</p>
                ) : (
                  <>
                    <h3 className={styles.recapTitle}>{r.title}</h3>
                    <p className={styles.recapSummary}>{r.summary}</p>
                    <Link
                      href={`/recaps/${r.entity_slug}/${r.meeting_date}`}
                      className={styles.readMore}
                    >
                      Read full recap →
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
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
