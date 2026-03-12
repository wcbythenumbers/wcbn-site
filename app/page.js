import styles from './page.module.css';
import Link from 'next/link';
import { MEETINGS, ENTITY_COLORS, formatDate } from './data/meetings';

export const metadata = {
  title: 'West Chester by the Numbers',
  description: 'Local government, by the numbers. Data-driven coverage of WCASD and its member municipalities.',
};

export default function Home() {
  return (
    <main className={styles.main}>
<section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>West Chester, PA</div>
            <h1 className={styles.headline}>
              West Chester<br />
              <span className={styles.headlineAccent}>by the Numbers</span>
            </h1>
            <p className={styles.tagline}>Local government, by the numbers.</p>
            <p className={styles.subtext}>
              Data-driven coverage of West Chester and surrounding areas —
              from borough hall to school board. Non-partisan. Clarity-first. Every claim cited, every source named.
            </p>
            <a href="#newsletter" className={styles.heroBtn}>Get the newsletter →</a>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Borough Residents</div>
              <div className={styles.statNumber}>~22,000</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>WCASD Students Served</div>
              <div className={styles.statNumber}>~12,000</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>School District Municipalities</div>
              <div className={styles.statNumber}>8</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Annual School Budget</div>
              <div className={styles.statNumber}>$250M+</div>
            </div>
          </div>
        </div>
        <div className={styles.heroRule}></div>
      </section>
      <section className={styles.mission}>
        <div className={styles.missionInner}>
          <div className={styles.missionLabel}>Our Mission</div>
          <blockquote className={styles.missionQuote}>
            "By the Numbers" signals an approach — not that every post is a spreadsheet,
            but that everything is grounded in verifiable data. Even qualitative posts
            lead with numbers where possible. Our goal is to make local government information
            accessible to everyone, regardless of how closely they follow local politics.
          </blockquote>
        </div>
      </section><section className={styles.pillars}>
        <div className={styles.pillarsInner}>
          <h2 className={styles.sectionTitle}>What We Cover</h2>
          <div className={styles.pillarGrid}>
            <div className={styles.pillar}>
              <div className={styles.pillarNumber}>01</div>
              <h3 className={styles.pillarTitle}>School District</h3>
              <p className={styles.pillarText}>WCASD budgets, board votes, enrollment trends, per-pupil spending, and school performance — all in one place.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarNumber}>02</div>
              <h3 className={styles.pillarTitle}>Municipal Government</h3>
              <p className={styles.pillarText}>Council meetings, budget breakdowns, development approvals, and public safety data across West Chester Borough and WCASD's member townships.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarNumber}>03</div>
              <h3 className={styles.pillarTitle}>Civic Education</h3>
              <p className={styles.pillarText}>Plain-language explainers on how local government works, where your tax dollars go, and how to participate.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.meetings}>
        <div className={styles.meetingsInner}>
          <div className={styles.meetingsHeader}>
            <h2 className={styles.meetingsTitle}>Upcoming Meetings</h2>
            <Link href="/calendar" className={styles.meetingsViewAll}>Full calendar →</Link>
          </div>
          <ul className={styles.meetingsList}>
            {MEETINGS.slice(0, 5).map((m) => {
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
          <div className={styles.meetingsFooter}>
            <Link href="/calendar" className={styles.meetingsFooterLink}>
              View full calendar →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.newsletter} id="newsletter">
        <div className={styles.newsletterInner}>
          <div className={styles.newsletterText}>
            <h2 className={styles.newsletterTitle}>Stay informed.</h2>
            <p className={styles.newsletterSubtext}>Get data-driven coverage of WCASD and its member municipalities delivered to your inbox. Free, always.</p>
          </div>
          <div className={styles.newsletterForm}>
            <div className={styles.beehiivPlaceholder}>
              <p>📬 Newsletter signup coming soon.</p>
              <p>Powered by Beehiiv.</p>
            </div>
          </div>
        </div>
      </section>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>West Chester by the Numbers</div>
          <div className={styles.footerTagline}>Non-partisan · Data-driven · Community-focused</div>
          <div className={styles.footerLinks}>
            <a href="#">About</a>
            <a href="#">Articles</a>
            <a href="#">Data Sources</a>
            <a href="#">Contact</a>
          </div>
          <div className={styles.footerDisclaimer}>
            westchesterbythenumbers.com · West Chester, PA
          </div>
        </div>
      </footer>
    </main>
  );
}
