import styles from './explainer.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'How Local Taxes Work — West Chester by the Numbers',
  description:
    'A plain-language guide to the local taxes paid by residents of West Chester and the surrounding area — property tax, EIT, LST, and more.',
};

const TOC = [
  { href: '#three-layers', label: 'The Three Layers of Local Tax' },
  { href: '#property-tax', label: 'Property Tax' },
  { href: '#eit', label: 'Earned Income Tax (EIT)' },
  { href: '#lst', label: 'Local Services Tax (LST)' },
  { href: '#realty-transfer', label: 'Realty Transfer Tax' },
  { href: '#adds-up', label: 'How It All Adds Up' },
];

export default function TaxExplainerPage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Budget</div>
          <h1 className={styles.heading}>How Local Taxes Work</h1>
          <p className={styles.intro}>
            If you live in West Chester or one of the surrounding townships, you
            pay local taxes to several different government bodies at the same
            time — and most people have never had anyone explain exactly how
            that works. This page does.
          </p>
        </div>
      </header>

      <div className={styles.content}>

        {/* Table of contents */}
        <nav className={styles.toc} aria-label="Page sections">
          <div className={styles.tocLabel}>On this page</div>
          <ol className={styles.tocList}>
            {TOC.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.tocLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Section 1 ── */}
        <section id="three-layers" className={styles.section}>
          <h2 className={styles.sectionHeading}>The Three Layers of Local Tax</h2>
          <p>
            No matter where you live in this area, your local tax bill comes
            from three separate government bodies — not one.
          </p>
          <div className={styles.layerGrid}>
            <div className={styles.layerCard}>
              <div className={styles.layerNum}>01</div>
              <h3 className={styles.layerTitle}>Your Municipality</h3>
              <p className={styles.layerText}>
                This is the Borough of West Chester or the township you live in
                — East Goshen, West Goshen, East Bradford, West Whiteland,
                Westtown, or Thornbury. Your municipality sets its own tax
                rates and provides services like local roads, police, and parks.
              </p>
            </div>
            <div className={styles.layerCard}>
              <div className={styles.layerNum}>02</div>
              <h3 className={styles.layerTitle}>Your County</h3>
              <p className={styles.layerText}>
                Most of WCASD's territory falls in Chester County, with some
                in Delaware County. The county sets its own rates and funds
                things like the court system, county parks, and social services.
              </p>
            </div>
            <div className={styles.layerCard}>
              <div className={styles.layerNum}>03</div>
              <h3 className={styles.layerTitle}>Your School District</h3>
              <p className={styles.layerText}>
                The West Chester Area School District (WCASD) covers all eight
                municipalities. It sets its own rates to fund school operations
                — and typically accounts for the largest share of your total
                local tax bill.
              </p>
            </div>
          </div>
          <p className={styles.callout}>
            Each of these three bodies sets its own rates independently, on its
            own budget cycle. A change in one does not affect the others.
          </p>
        </section>

        {/* ── Section 2 ── */}
        <section id="property-tax" className={styles.section}>
          <h2 className={styles.sectionHeading}>Property Tax</h2>
          <p>
            Property tax is the main revenue source for local governments and
            school districts. If you own a home or other real property, you pay
            it every year — whether or not you have a mortgage.
          </p>
          <h3 className={styles.subheading}>How the math works</h3>
          <p>
            Your bill is calculated using two numbers: your property's{' '}
            <strong>assessed value</strong> and the{' '}
            <strong>millage rate</strong> set by each taxing body.
          </p>
          <div className={styles.formula}>
            Assessed Value &times; Millage Rate ÷ 1,000 = Annual Tax
          </div>
          <dl className={styles.defList}>
            <dt>Assessed value</dt>
            <dd>
              The value assigned to your property by the county assessor's
              office. This is <em>not</em> the same as market value — what your
              home would sell for today. Counties reassess properties
              periodically, so assessed values can lag behind the market
              significantly.
            </dd>
            <dt>Millage rate (or mill rate)</dt>
            <dd>
              One mill equals one dollar of tax per thousand dollars of assessed
              value. A millage rate of 20 mills on a property assessed at
              $200,000 produces a $4,000 annual tax bill from that one body.
            </dd>
          </dl>
          <h3 className={styles.subheading}>Three separate bills</h3>
          <p>
            Because three separate entities tax your property, you receive
            three separate tax bills each year — one from your municipality,
            one from your county, and one from WCASD. They arrive on different
            schedules throughout the year and are paid separately.
          </p>
          <p>
            If you have a mortgage with an escrow account, your lender
            typically collects a portion each month and pays these bills on
            your behalf. But the bills are still issued to you, and it's worth
            understanding what you're paying.
          </p>
        </section>

        {/* ── Section 3 ── */}
        <section id="eit" className={styles.section}>
          <h2 className={styles.sectionHeading}>Earned Income Tax (EIT)</h2>
          <p>
            The Earned Income Tax is a percentage tax on wages, salaries,
            self-employment income, and certain other earnings. If you work and
            earn income, you pay it.
          </p>
          <h3 className={styles.subheading}>Who collects it</h3>
          <p>
            In Chester County, EIT is collected by{' '}
            <strong>Keystone Collections Group</strong> on behalf of the
            municipalities and school districts. You don't pay the municipality
            and WCASD separately — Keystone handles collection and distributes
            the revenue to each.
          </p>
          <h3 className={styles.subheading}>How the split works</h3>
          <p>
            Your total EIT rate is divided between your municipality and your
            school district. Each sets its portion of the rate. The combined
            total is what's withheld from your paycheck or paid directly if
            you're self-employed.
          </p>
          <h3 className={styles.subheading}>For most employees, it's automatic</h3>
          <p>
            If you're employed by a company, your employer withholds EIT from
            each paycheck and remits it on your behalf — similar to federal
            income tax withholding. You generally only need to file directly
            with Keystone if you have self-employment income, investment income
            subject to EIT, or your employer didn't withhold correctly.
          </p>
          <p className={styles.callout}>
            You pay EIT based on where you <em>live</em>, not necessarily where
            you work — with some exceptions. If you work in a different
            municipality that levies a higher rate, credit rules may apply.
            Keystone's website has guidance for these situations.
          </p>
        </section>

        {/* ── Section 4 ── */}
        <section id="lst" className={styles.section}>
          <h2 className={styles.sectionHeading}>Local Services Tax (LST)</h2>
          <p>
            The Local Services Tax is a small flat tax levied on anyone who
            works within a municipality — regardless of where they live.
          </p>
          <dl className={styles.defList}>
            <dt>How much</dt>
            <dd>
              The maximum allowable LST is <strong>$52 per year</strong> (one
              dollar per week). Most municipalities levy the full amount.
            </dd>
            <dt>Who pays it</dt>
            <dd>
              Anyone employed within that municipality pays it — so if you
              commute into West Chester Borough to work, you pay the Borough's
              LST, even if you live in East Goshen.
            </dd>
            <dt>How it's collected</dt>
            <dd>
              Employers withhold it from employees' paychecks in installments
              throughout the year and remit it to the municipality where the
              work is performed.
            </dd>
            <dt>Exemptions</dt>
            <dd>
              People who earn less than a certain annual threshold are exempt.
              If you work multiple jobs, you should only pay LST once — there
              are refund procedures if it's withheld in error by more than one
              employer.
            </dd>
          </dl>
        </section>

        {/* ── Section 5 ── */}
        <section id="realty-transfer" className={styles.section}>
          <h2 className={styles.sectionHeading}>Realty Transfer Tax</h2>
          <p>
            The Realty Transfer Tax is a one-time tax paid when real property
            changes hands — at the closing of a home sale, for example. It is
            not an ongoing annual tax.
          </p>
          <h3 className={styles.subheading}>Who pays it</h3>
          <p>
            By custom, the cost is typically split between buyer and seller,
            though this is negotiable and set by the purchase agreement.
          </p>
          <h3 className={styles.subheading}>How it's split</h3>
          <p>
            The total rate is divided among three entities: the Commonwealth of
            Pennsylvania, your school district, and your municipality. Each
            takes a portion. The state's share is set in state law; the local
            shares are set independently by WCASD and the relevant municipality.
          </p>
          <p className={styles.callout}>
            Because this tax is paid at closing, it's one that most residents
            only encounter when buying or selling property. Your real estate
            attorney or title company will calculate and collect it as part of
            the closing process.
          </p>
        </section>

        {/* ── Section 6 ── */}
        <section id="adds-up" className={styles.section}>
          <h2 className={styles.sectionHeading}>How It All Adds Up</h2>
          <p>
            Taken together, these taxes — property tax, EIT, LST, and the
            realty transfer tax — form the local tax system that funds your
            schools, your municipality, and your county government. They're set
            by different bodies, collected by different agencies, and paid on
            different schedules.
          </p>
          <p>
            The total burden varies from one community to the next. A homeowner
            in West Chester Borough pays different combined rates than a
            homeowner in East Goshen Township — and both differ from someone in
            West Whiteland. Where you live matters.
          </p>
          <div className={styles.linkBlock}>
            <p className={styles.linkBlockLabel}>Go deeper</p>
            <Link href="#" className={styles.deepLink}>
              Tax Rate Comparisons →
            </Link>
            <Link href="#" className={styles.deepLink}>
              Where Your Tax Dollars Go →
            </Link>
          </div>
        </section>

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
