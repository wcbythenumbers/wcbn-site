'use client';

import { useMemo, useState } from 'react';
import MunicipalityFilter from '../components/MunicipalityFilter';
import EntityTag from '../components/EntityTag';
import { formatDate, isCurrentYear, isTodayOrFuture } from '../../lib/format';
import styles from './calendar.module.css';

// "Mon, March 17, 2026" -> "March 2026" grouping key, safe against bad dates.
function monthLabel(dateStr) {
  if (!dateStr) return 'Unscheduled';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return 'Unscheduled';
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByMonth(meetings) {
  return meetings.reduce((acc, meeting) => {
    const key = monthLabel(meeting.meeting_date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(meeting);
    return acc;
  }, {});
}

export default function CalendarClient({ meetings }) {
  const [selected, setSelected] = useState([]);
  const isAllActive = selected.length === 0;

  // Current-year meetings (past or future) plus any future meeting, so the
  // calendar doesn't silently drop the rest of this year's past meetings
  // while still excluding stale meetings from prior years.
  const relevant = useMemo(
    () => meetings.filter((m) => isCurrentYear(m.meeting_date) || isTodayOrFuture(m.meeting_date)),
    [meetings]
  );

  const filtered = useMemo(
    () =>
      relevant
        .filter((m) => isAllActive || selected.includes(m.entity_id))
        .sort((a, b) => (a.meeting_date < b.meeting_date ? -1 : a.meeting_date > b.meeting_date ? 1 : 0)),
    [relevant, selected, isAllActive]
  );

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Public Meetings</div>
          <h1 className={styles.heading}>Meeting Calendar</h1>
          <p className={styles.intro}>
            Upcoming public meetings for WCASD, West Chester Borough, and all eight
            member townships. Agendas are linked when available. All times are local.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <MunicipalityFilter selected={selected} onChange={setSelected} />

        {meetings.length === 0 ? (
          <p className={styles.emptyText}>No meetings scheduled yet. Check back soon.</p>
        ) : filtered.length === 0 ? (
          <p className={styles.emptyText}>No meetings match this filter.</p>
        ) : (
          Object.entries(grouped).map(([month, monthMeetings]) => (
            <section key={month} className={styles.monthGroup}>
              <h2 className={styles.monthHeading}>{month}</h2>
              <ul className={styles.meetingsList}>
                {monthMeetings.map((m, i) => (
                  <li key={`${m.entity}-${m.meeting_date}-${i}`} className={styles.meetingEntry}>
                    <div className={styles.meetingTop}>
                      <div className={styles.meetingMeta}>
                        <EntityTag id={m.entity_id} name={m.entity} />
                        <span className={styles.meetingType}>{m.meeting_type}</span>
                        <span className={styles.meetingDateTime}>
                          {formatDate(m.meeting_date)} · {m.meeting_time}
                        </span>
                        <span className={styles.meetingLocation}>{m.location}</span>
                        {m.recap_status === 'Recap Published' && m.recap_url && (
                          <a href={m.recap_url} className={styles.recapLink}>Read Recap →</a>
                        )}
                        {m.recap_status === 'Recap Pending' && (
                          <span className={styles.recapPending}>Recap coming soon</span>
                        )}
                      </div>
                      {m.more_info_url && (
                        <a href={m.more_info_url} className={styles.meetingAgenda} target="_blank" rel="noopener noreferrer">More Info & Webcast</a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© 2025 West Chester by the Numbers</span>
          <div className={styles.footerLinks}>
            <a href="/about">About</a>
            <a href="/articles">Articles</a>
            <a href="/subscribe">Subscribe</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
