'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import styles from './rates.module.css';
import MethodNote from '../../components/MethodNote';

// Rates (county, municipal, school, eit) come from the TaxRates sheet; see withRates.
const MUNICIPALITY_INFO = [
  {
    id: 'wc-borough',
    name: 'West Chester Borough',
    shortName: 'WC Borough',
    lst: 52,
  },
  {
    id: 'east-goshen',
    name: 'East Goshen Township',
    shortName: 'East Goshen',
    lst: 52,
  },
  {
    id: 'west-goshen',
    name: 'West Goshen Township',
    shortName: 'West Goshen',
    lst: 52,
  },
  {
    id: 'east-bradford',
    name: 'East Bradford Township',
    shortName: 'East Bradford',
    lst: 52,
  },
  {
    id: 'west-whiteland',
    name: 'West Whiteland Township',
    shortName: 'West Whiteland',
    lst: 52,
  },
  {
    id: 'westtown',
    name: 'Westtown Township',
    shortName: 'Westtown',
    lst: 52,
  },
  {
    id: 'thornbury-chester',
    name: 'Thornbury Twp (Chester Co.)',
    shortName: 'Thornbury (Chester)',
    lst: 52,
  },
  {
    id: 'thornbury-delaware',
    name: 'Thornbury Twp (Delaware Co.)',
    shortName: 'Thornbury (Del. Co.)',
    lst: 0,
    lstNote: 'Thornbury Township (Delaware Co.) does not levy a local services tax.',
    municipalNote: 'This municipality levies no municipal property tax.',
  },
];

// "Thornbury Twp (Chester Co.)" and "Thornbury Township (Chester Co.)" match.
const nameKey = (name) => String(name ?? '').replace(/\bTownship\b/g, 'Twp').trim();

const sumRates = (rows) => +rows.reduce((total, r) => total + r.rate, 0).toFixed(4);

// Adds sheet rates to each municipality, matched by full name (see nameKey). County and
// municipal are sums of their Property rows (municipal 0 if none); eit is the
// sum of Earned income rows, shown as a percent with two decimals.
function withRates(rates) {
  return MUNICIPALITY_INFO.map((m) => {
    const rows = rates.filter((r) => nameKey(r.municipality) === nameKey(m.name));
    const property = rows.filter((r) => r.tax_type === 'Property');
    const ofType = (type) => property.filter((r) => r.taxing_body_type === type);
    return {
      ...m,
      county: sumRates(ofType('County')),
      municipal: sumRates(ofType('Municipality')),
      school: sumRates(ofType('School district')),
      eit: `${sumRates(rows.filter((r) => r.tax_type === 'Earned income')).toFixed(2)}%`,
    };
  });
}

const ALL_IDS = MUNICIPALITY_INFO.map((m) => m.id);

function getAssessmentRatio(m) {
  return m.id === 'thornbury-delaware' ? 0.85 : 0.35;
}

function getTotalMillage(m) {
  if (m.municipal === null) return null;
  return +(m.county + m.municipal + m.school).toFixed(3);
}

function millToDollar(mills, assessed) {
  return (mills * assessed) / 1000;
}

function fmt$(n) {
  return '$' + Math.round(n).toLocaleString();
}

function fmtMillage(n) {
  return n.toFixed(3);
}

const SOURCES = [
  {
    category: 'Property Tax',
    links: [
      { label: 'Chester County Tax Rates', href: 'https://www.chesco.org/1585/Tax-Rates' },
      { label: 'Chester County Assessment Office', href: 'https://www.chesco.org/213/Assessment' },
      { label: 'Delaware County Assessment Office', href: 'https://www.delcopa.gov/assessment/index.html' },
      { label: 'WCASD Real Estate Taxes', href: 'https://www.wcasd.net/our-team/departments/business-finance/real-estate-taxes' },
    ],
  },
  {
    category: 'Earned Income Tax',
    links: [
      { label: 'Keystone Collections Group', href: 'https://keystonecollects.com' },
      { label: 'PA DCED PSD Codes & EIT Rates', href: 'https://dced.pa.gov/local-government/local-income-tax-information/psd-codes-and-eit-rates/' },
    ],
  },
  {
    category: 'Municipal Tax Information',
    links: [
      { label: 'West Chester Borough Finance', href: 'https://www.west-chester.com/299/Finance' },
      { label: 'East Goshen Township', href: 'https://eastgoshen.org' },
      { label: 'West Goshen Township Tax Collector', href: 'https://www.westgoshen.org/169/Tax-Collector' },
      { label: 'East Bradford Township Taxes', href: 'https://www.eastbradford.org/205/Taxes-Audits' },
      { label: 'West Whiteland Township Taxes', href: 'https://www.westwhiteland.org/181/Taxes' },
      { label: 'Westtown Township Taxes', href: 'https://westtownpa.org/taxes/' },
      { label: 'Thornbury Township (Chester Co.)', href: 'https://www.thornburytwp.com' },
      { label: 'Thornbury Township (Delaware Co.) Local Tax Information', href: 'https://www.thornbury.org/residents/page/local-tax-information' },
    ],
  },
];

const TOOLTIP_STYLE = {
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: '0.72rem',
  background: '#0A1931',
  border: 'none',
  color: '#F8F6F0',
  borderRadius: 2,
};

export default function RatesClient({ rates = [] }) {
  const MUNICIPALITIES = useMemo(() => withRates(rates), [rates]);
  const [selected, setSelected] = useState(new Set(ALL_IDS));
  const [viewMode, setViewMode] = useState('millage');
  const [marketValue, setMarketValue] = useState(400000);
  const [earnedIncome, setEarnedIncome] = useState(75000);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [tableScrolled, setTableScrolled] = useState(false);
  const tableWrapRef = useRef(null);

  useEffect(() => {
    setTableScrolled(false);
  }, [viewMode]);

  const allSelected = selected.size === MUNICIPALITIES.length;

  const toggleMuni = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(ALL_IDS));
  const deselectAll = () => setSelected(new Set([ALL_IDS[0]]));

  const visible = MUNICIPALITIES.filter((m) => selected.has(m.id));

  const chartData = visible
    .map((m) => {
      const totalMillage = getTotalMillage(m);
      const ratio = getAssessmentRatio(m);
      const assessed = marketValue * ratio;
      const eitDollar = (parseFloat(m.eit) / 100) * earnedIncome;
      const value =
        viewMode === 'millage'
          ? (totalMillage !== null ? +((totalMillage * ratio) / 10).toFixed(4) : null)
          : totalMillage !== null
          ? millToDollar(totalMillage, assessed) + eitDollar + m.lst
          : null;
      return { id: m.id, name: m.shortName, value };
    })
    .filter((d) => d.value !== null);

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 1;

  const chartHeight = Math.max(220, chartData.length * 54);

  const labelFormatter = (val) =>
    viewMode === 'millage' ? val.toFixed(2) + '%' : fmt$(val);

  const tooltipFormatter = (val) =>
    viewMode === 'millage'
      ? [val.toFixed(2) + '%', 'Effective Millage Rate']
      : [fmt$(val), 'Est. Total Annual Local Tax'];

  return (
    <main className={styles.main}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Finances</div>
          <h1 className={styles.heading}>Tax Rate Comparisons</h1>
          <p className={styles.intro}>
            Compare local tax rates across the municipalities in the greater
            West Chester area. All three layers of local taxation are included:
            property tax (county + municipal + school district millage), earned
            income tax (EIT), and local services tax (LST).
          </p>
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Municipality toggles ── */}
        <section className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>Select municipalities</div>
            <div className={styles.selectAllRow}>
              <button
                className={styles.selectAllBtn}
                onClick={allSelected ? deselectAll : selectAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
          <div className={styles.toggleGrid}>
            {MUNICIPALITIES.map((m) => (
              <button
                key={m.id}
                className={`${styles.toggleBtn} ${selected.has(m.id) ? styles.toggleActive : ''}`}
                onClick={() => toggleMuni(m.id)}
                aria-pressed={selected.has(m.id)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── View mode toggle ── */}
        <section className={styles.viewSection}>
          <div className={styles.viewToggleGroup} role="group" aria-label="View mode">
            <button
              className={`${styles.viewBtn} ${viewMode === 'millage' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('millage')}
              aria-pressed={viewMode === 'millage'}
            >
              Tax Rates
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'dollar' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('dollar')}
              aria-pressed={viewMode === 'dollar'}
            >
              Dollar Amount
            </button>
          </div>
        </section>

        {/* ── Dollar mode: inputs + collapsible ── */}
        {viewMode === 'dollar' && (
          <section className={styles.assessedSection}>
            <div className={styles.dollarInputsRow}>
              {/* Market value */}
              <div className={styles.dollarInputGroup}>
                <label className={styles.assessedLabel} htmlFor="market-value-input">
                  Estimated home market value
                </label>
                <div className={styles.assessedInputRow}>
                  <span className={styles.assessedDollarSign}>$</span>
                  <input
                    id="market-value-input"
                    type="number"
                    min="0"
                    step="10000"
                    className={styles.assessedInput}
                    value={marketValue}
                    onChange={(e) =>
                      setMarketValue(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                </div>
                <p className={styles.assessedDisplay}>
                  Chester Co. assessed value used:{' '}
                  <strong>${Math.round(marketValue * 0.35).toLocaleString()}</strong>
                  {' · '}
                  Del. Co.:{' '}
                  <strong>${Math.round(marketValue * 0.85).toLocaleString()}</strong>
                </p>
                <p className={styles.disclosureNote}>
                  Assessment ratios are approximate. Chester County last reassessed
                  in 2021; your assessed value may not reflect current market value.
                </p>
                <p className={styles.disclosureNote}>
                  This tool is designed to compare relative tax rates across
                  municipalities, not to calculate your exact tax bill. For your
                  actual tax liability, refer to your county tax bill or contact
                  the taxing authority.
                </p>
              </div>

              {/* Earned income */}
              <div className={styles.dollarInputGroup}>
                <label className={styles.assessedLabel} htmlFor="income-input">
                  Annual earned income
                </label>
                <div className={styles.assessedInputRow}>
                  <span className={styles.assessedDollarSign}>$</span>
                  <input
                    id="income-input"
                    type="number"
                    min="0"
                    step="1000"
                    className={styles.assessedInput}
                    value={earnedIncome}
                    onChange={(e) =>
                      setEarnedIncome(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                </div>
                <p className={styles.eitNote}>
                  EIT estimate assumes all earned income is subject to local
                  EIT. Actual liability may vary based on your work location,
                  employer withholding, and other factors.
                </p>
              </div>
            </div>

            <p className={styles.assessmentRatioNote}>
              Chester County properties are assessed at approximately 35% of
              market value; Delaware County at approximately 85%.
            </p>
          </section>
        )}

        {/* ── Table ── */}
        <section className={styles.tableSection}>
          <div className={styles.printRow}>
            <button className={styles.printBtn} onClick={() => window.print()}>
              Print / Save as PDF
            </button>
          </div>
          <div
            className={styles.tableWrap}
            ref={tableWrapRef}
            onScroll={() => setTableScrolled(true)}
          >
            {viewMode === 'millage' ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thMuni}>Municipality</th>
                    <th className={styles.thNum}>County<br />Millage</th>
                    <th className={styles.thNum}>Municipal<br />Millage</th>
                    <th className={styles.thNum}>School<br />Millage</th>
                    <th className={`${styles.thNum} ${styles.thTotal}`}>Total<br />Millage</th>
                    <th className={styles.thNum}>Effective<br />Millage Rate</th>
                    <th className={`${styles.thNum} ${styles.thSeparatorLeft}`}>EIT Rate<br />(Residents)</th>
                    <th className={styles.thNum}>LST<br />(flat)</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => {
                    const total = getTotalMillage(m);
                    return (
                      <tr key={m.id} className={styles.tr}>
                        <td className={styles.tdMuni}>{m.name}</td>
                        <td className={styles.tdNum}>{fmtMillage(m.county)}</td>
                        <td className={styles.tdNum}>
                          {fmtMillage(m.municipal)}
                          {m.municipalNote && (
                            <sup className={styles.noteRef} title={m.municipalNote}>†</sup>
                          )}
                        </td>
                        <td className={styles.tdNum}>{m.school.toFixed(2)}</td>
                        <td className={`${styles.tdNum} ${styles.tdTotal}`}>
                          {total !== null ? fmtMillage(total) : <span className={styles.tbd}>N/A</span>}
                        </td>
                        <td className={`${styles.tdNum} ${styles.tdTotal}`}>
                          {total !== null
                            ? ((total * getAssessmentRatio(m)) / 10).toFixed(2) + '%'
                            : <span className={styles.tbd}>N/A</span>}
                        </td>
                        <td className={`${styles.tdNum} ${styles.tdSeparatorLeft}`}>{m.eit}</td>
                        <td className={styles.tdNum}>
                          {fmt$(m.lst)}
                          {m.lstNote && (
                            <sup className={styles.noteRef} title={m.lstNote}>‡</sup>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thMuni}>Municipality</th>
                    <th className={styles.thNum}>County Tax</th>
                    <th className={styles.thNum}>Municipal Tax</th>
                    <th className={styles.thNum}>School Tax</th>
                    <th className={styles.thNum}>Total<br />Property Tax</th>
                    <th className={`${styles.thNum} ${styles.thSeparatorLeft}`}>EIT ($)</th>
                    <th className={styles.thNum}>LST</th>
                    <th className={`${styles.thNum} ${styles.thTotal}`}>Total Est.<br />Annual Local Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => {
                    const assessed = marketValue * getAssessmentRatio(m);
                    const countyTax = millToDollar(m.county, assessed);
                    const muniTax = millToDollar(m.municipal, assessed);
                    const schoolTax = millToDollar(m.school, assessed);
                    const propTotal = countyTax + muniTax + schoolTax;
                    const eitDollar = (parseFloat(m.eit) / 100) * earnedIncome;
                    const grandTotal = propTotal + eitDollar + m.lst;
                    return (
                      <tr key={m.id} className={styles.tr}>
                        <td className={styles.tdMuni}>{m.name}</td>
                        <td className={styles.tdNum}>{fmt$(countyTax)}</td>
                        <td className={styles.tdNum}>
                          {fmt$(muniTax)}
                          {m.municipalNote && (
                            <sup className={styles.noteRef} title={m.municipalNote}>†</sup>
                          )}
                        </td>
                        <td className={styles.tdNum}>{fmt$(schoolTax)}</td>
                        <td className={styles.tdNum}>{fmt$(propTotal)}</td>
                        <td className={`${styles.tdNum} ${styles.tdSeparatorLeft}`}>{fmt$(eitDollar)}</td>
                        <td className={styles.tdNum}>
                          {fmt$(m.lst)}
                          {m.lstNote && (
                            <sup className={styles.noteRef} title={m.lstNote}>‡</sup>
                          )}
                        </td>
                        <td className={`${styles.tdNum} ${styles.tdTotal}`}>
                          {fmt$(grandTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!tableScrolled && (
            <p className={styles.scrollHint} aria-hidden="true">
              Scroll right to see all columns →
            </p>
          )}
          {viewMode === 'millage' && (
            <p className={styles.tableFootnote}>
              <strong>Effective Rate</strong> = Total Combined Millage × County Assessment
              Ratio ÷ 1,000. Chester County assesses property at approximately 35% of market
              value; Delaware County at approximately 85%. This rate allows for a more
              accurate comparison of property tax burden across county lines.
            </p>
          )}
          {visible.some((m) => m.municipalNote) && (
            <p className={styles.tableFootnote}>
              † Thornbury Township (Delaware Co.) levies no municipal property tax.
            </p>
          )}
          {visible.some((m) => m.lstNote) && (
            <p className={styles.tableFootnote}>
              ‡ Thornbury Township (Delaware Co.) does not levy a local services tax.
            </p>
          )}
          <p className={styles.tableFootnote}>
            Chester County offers a Homestead Exclusion that reduces the assessed value of
            primary residences for school tax purposes. Qualifying properties may have a
            lower WCASD tax bill than shown.
          </p>
        </section>

        {/* ── Bar chart ── */}
        {chartData.length > 0 && (
          <section className={styles.chartSection}>
            <h2 className={styles.chartTitle}>
              {viewMode === 'millage'
                ? 'Effective Millage Rate (% of Market Value)'
                : 'Total Estimated Annual Local Tax'}
            </h2>
            <p className={styles.chartSubtitle}>
              {viewMode === 'dollar'
                ? `Property tax + EIT + LST. Market value ${fmt$(marketValue)}, earned income ${fmt$(earnedIncome)}.`
                : 'Total millage × county assessment ratio ÷ 1,000. Accounts for the difference in assessment ratios between Chester Co. (35%) and Delaware Co. (85%).'}
            </p>
            <div style={{ width: '100%', height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 0, right: 72, left: 10, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, maxValue * 1.02]}
                    tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: '#555' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={labelFormatter}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={128}
                    tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fill: '#0A1931' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: 'rgba(10,25,49,0.05)' }}
                    formatter={tooltipFormatter}
                  />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.value === maxValue ? '#C9A84C' : '#0A1931'}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={labelFormatter}
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: 11,
                        fill: '#0A1931',
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── Disclaimer ── */}
        <div className={styles.disclaimer}>
          <p>
            Tax rates change annually and this page may not reflect the most
            current figures. If you notice a discrepancy, please contact us at{' '}
            <a
              href="mailto:hello@westchesterbythenumbers.com"
              className={styles.disclaimerLink}
            >
              hello@westchesterbythenumbers.com
            </a>{' '}
            — we appreciate the help keeping this accurate. Always verify
            current rates directly with the taxing authority before relying on
            this information for any purpose.
          </p>
        </div>

        <MethodNote summary="About this data">
          <p>
            Property tax rates for each county, municipality and WCASD are the
            adopted rates for 2026 (WCASD: the 2026-27 school year). Earned
            income tax rates are from the Pennsylvania Department of Community
            and Economic Development&apos;s local tax register. The local
            services tax is $52 a year in every municipality shown except
            Thornbury Township (Delaware Co.), which does not levy it. Estimated
            totals are calculated by WCBN: total millage × assessed value ÷
            1,000, plus earned income × the combined earned income tax rate,
            plus the local services tax. Assessed value is the market value you
            enter times the county&apos;s approximate assessment ratio (Chester
            County 35%, Delaware County 85%); the effective rate uses the same
            ratios. Estimates do not apply the homestead exclusion or other
            exemptions. Your tax bill is the authoritative amount. Sources are
            listed under Sources &amp; Additional Information.
          </p>
        </MethodNote>

        {/* ── Sources & Additional Information ── */}
        <div className={styles.sourcesSection}>
          <button
            className={styles.sourcesToggle}
            onClick={() => setSourcesOpen(!sourcesOpen)}
            aria-expanded={sourcesOpen}
          >
            <span>Sources &amp; Additional Information</span>
            <span className={styles.sourcesArrow}>{sourcesOpen ? '▲' : '▼'}</span>
          </button>

          {sourcesOpen && (
            <div className={styles.sourcesBody}>
              {SOURCES.map((group) => (
                <div key={group.category} className={styles.sourcesGroup}>
                  <div className={styles.sourcesCategoryLabel}>{group.category}</div>
                  <ul className={styles.sourcesList}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourcesLink}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Explore more callout ── */}
        <div className={styles.exploreBlock}>
          <div className={styles.exploreLabel}>Explore more</div>
          <Link href="/taxes/explainer" className={styles.explainerLinkAnchor}>
            Read: How Local Taxes Work →
          </Link>
          <Link href="/taxes/dollars" className={styles.explainerLinkAnchor}>
            Read: Where Your Tax Dollars Go →
          </Link>
        </div>

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
