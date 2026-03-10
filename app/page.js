import styles from './page.module.css';

export const metadata = {
  title: 'West Chester by the Numbers',
  description: 'Local government, by the numbers. Data-driven coverage of West Chester Borough and WCASD governance.',
};

export default function Home() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.navLogo}>WCBN</span>
          <div className={styles.navLinks}>
            <a href="#">About</a>
            <a href="#">Articles</a>
            <a href="#newsletter" className={styles.navCta}>Subscribe</a>
          </div>
        </div>
      </nav>
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
              Data-driven coverage of West Chester Borough and WCASD governance.
              Non-partisan. Clarity-first. Always showing the work.
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
              <div className={styles.statNumber}>8+</div>
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
            lead with numbers where possible.
          </blockquote>
        </div>
      </section>
      <section className={styles.pillars}>
        <div className={styles.pillarsInner}>
          <h2 className={styles.sectionTitle}>What We Cover</h2>
          <div className={styles.pillarGrid}>
            <div className={styles.pillar}>
              <div className={styles.pillarNumber}>01</div>
              <h3>School District</h3>
              <p>WCASD budgets, board votes, enrollment trends, per-pupil spending, and school performance — all in one place.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarNumber}>02</div>
              <h3>Borough Government</h3>
              <p>West Chester Borough council meetings, budget breakdowns, development approvals, and public safety data.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarNumber}>03</div>
              <h3>Civic Education</h3>
              <p>Plain-language explainers on how local government works, where your tax dollars go, and how to participate.</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.newsletter} id="newsletter">
        <div className={styles.newsletterInner}>
          <div className={styles.newsletterText}>
            <h2>Stay informed.</h2>
            <p>Get data-driven coverage of West Chester Borough and WCASD delivered to your inbox. Free, always.</p>
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
