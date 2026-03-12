import styles from './calendar.module.css';
import { MEETINGS, ENTITY_COLORS, formatDate, groupByMonth } from '../data/meetings';

export const metadata = {
  title: 'Meeting Calendar — West Chester by the Numbers',
  description: 'Upcoming public meetings for WCASD, West Chester Borough, and all member townships.',
};

export default function CalendarPage() {
  const grouped = groupByMonth(MEETINGS);

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
        {Object.entries(grouped).map(([month, meetings]) => (
          <section key={month} className={styles.monthGroup}>
            <h2 className={styles.monthHeading}>{month}</h2>
            <ul className={styles.meetingsList}>
              {meetings.map((m) => {
                const tag = ENTITY_COLORS[m.entityKey];
                return (
                  <li key={m.id} className={styles.meetingEntry}>
                    <div className={styles.meetingTop}>
                      <div className={styles.meetingMeta}>
                        <span
                          className={styles.entityTag}
                          style={{ background: tag.bg, color: tag.color }}
                        >
                          {m.entity}
                        </span>
                        <span className={styles.meetingType}>{m.type}</span>
                        <span className={styles.meetingDateTime}>
                          {formatDate(m.date)} · {m.time}
                        </span>
                        <span className={styles.meetingLocation}>{m.location}</span>
                      </div>
                      <a href={m.agendaHref} className={styles.meetingAgenda}>Agenda</a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
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
