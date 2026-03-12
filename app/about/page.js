import styles from './about.module.css';

export const metadata = {
      title: 'About — West Chester by the Numbers',
      description: 'About West Chester by the Numbers — a data-driven, non-partisan publication covering WCASD and its member municipalities.',
};

export default function AboutPage() {
      return (
              <main className={styles.main}>

                <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navLogo}>WCBN</a>
              <div className={styles.navLinks}>
            <a href="/about">About</a>
                <a href="/articles">Articles</a>
                <a href="/subscribe" className={styles.navCta}>Subscribe</a>
          </div>
          </div>
          </nav>

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>About</div>
              <h1 className={styles.heading}>West Chester<br />by the Numbers</h1>
              <p className={styles.tagline}>Local government, by the numbers.</p>
          </div>
          </header>

      <div className={styles.content}>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>What This Is</h2>
              <p>West Chester by the Numbers is a data-driven publication covering local government across the West Chester Area School District (WCASD) and its eight member municipalities: West Chester Borough, East Goshen Township, West Goshen Township, East Bradford Township, West Whiteland Township, Westtown Township, and both Thornbury Townships (Chester and Delaware Counties). We track budgets, board votes, spending trends, election results, and civic data — and present it in a way that's clear, accessible, and grounded in verifiable public records.</p>
                    <p>The name signals an approach, not a format. Not every piece is a spreadsheet. But everything is rooted in documented facts, real numbers, and identified sources — cited transparently so readers can verify what we report.</p>
          </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Editorial Philosophy</h2>
              <ul className={styles.list}>
            <li><strong>Non-partisan.</strong> We cover facts, not sides. We do not endorse candidates, parties, or political positions.</li>
                      <li><strong>Clarity first.</strong> Government data is often dense and inaccessible. Our job is to make it understandable without distorting it.</li>
                      <li><strong>Cite everything.</strong> Every claim links to a source. Every number identifies where it came from and when it was accessed.</li>
                      <li><strong>Corrections matter.</strong> When we get something wrong, we correct it promptly and note it on the original post.</li>
          </ul>
          </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>What We Cover</h2>
              <div className={styles.pillars}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>01</div>
                  <h3 className={styles.pillarTitle}>School District</h3>
                  <p className={styles.pillarText}>WCASD budgets, board votes, enrollment trends, per-pupil spending, staff data, and school performance metrics.</p>
          </div>
                <div className={styles.pillar}>
              <div className={styles.pillarNum}>02</div>
                  <h3 className={styles.pillarTitle}>Municipal Government</h3>
                  <p className={styles.pillarText}>Council and township supervisor votes, budget breakdowns, development activity, public safety data, and property tax analysis across WCASD's member municipalities.</p>
          </div>
                <div className={styles.pillar}>
              <div className={styles.pillarNum}>03</div>
                  <h3 className={styles.pillarTitle}>Civic Education</h3>
                  <p className={styles.pillarText}>Explainers on how local government works, voter turnout data, township comparisons, and historical trend analysis.</p>
          </div>
          </div>
          </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Data Sources</h2>
              <p>We draw primarily from public records and government-published data, including:</p>
              <ul className={styles.list}>
            <li>Pennsylvania Department of Education Annual Financial Reports (AFR)</li>
                <li>Open Book PA (Pennsylvania Treasury)</li>
                <li>WCASD adopted budgets and BoardDocs meeting records</li>
                <li>Borough of West Chester Agenda Center, CAFR, and annual budgets</li>
                <li>Township meeting minutes, budgets, and CAFR filings for WCASD member municipalities</li>
                <li>Chester County Open Data, GIS, and Elections Office</li>
                <li>Delaware County Open Data and Elections Office</li>
                <li>U.S. Census Bureau / American Community Survey</li>
                <li>Chester County Court of Common Pleas public docket</li>
                <li>Right-to-Know requests filed under Pennsylvania's RTKL</li>
          </ul>
              <p>Data is identified by source and access date on each post. Government agencies periodically revise published data; we note material changes when we become aware of them.</p>
          </section>

        <section className={styles.disclaimerBox}>
          <h2 className={styles.disclaimerHeading}>Disclaimer</h2>
              <p>All content on West Chester by the Numbers is provided for informational purposes only and does not constitute legal, financial, investment, or professional advice of any kind.</p>
              <p>We make reasonable efforts to ensure accuracy, but we do not warrant that all information is complete, current, or error-free. Data is sourced from public records and third-party government sources; we are not responsible for errors or omissions in those underlying sources.</p>
              <p>Coverage of litigation and legal matters is based solely on public court records and documented facts. We do not opine on the merits of active cases.</p>
              <p>Nothing on this site should be relied upon as the basis for any legal, financial, or civic decision without independent verification.</p>
          </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Contact</h2>
              <p>Questions, corrections, tips, or feedback: <a href="mailto:hello@westchesterbythenumbers.com" className={styles.link}>hello@westchesterbythenumbers.com</a></p>
                    <p>Right-to-Know requests we've filed are available upon request. If you believe something we've published contains a factual error, please reach out and we will review it promptly.</p>
          </section>

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
