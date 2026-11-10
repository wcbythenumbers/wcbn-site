'use client';

import { useMemo, useState } from 'react';
import styles from './finances.module.css';

const MUNICIPALITIES = [
  'West Chester Borough',
  'East Bradford Township',
  'East Goshen Township',
  'West Goshen Township',
  'West Whiteland Township',
  'Westtown Township',
  'Thornbury Township (Chester Co.)',
  'Thornbury Township (Delaware Co.)',
];
const ALL_MUNICIPALITIES = 'All municipalities';
const DEFAULT_MUNICIPALITY = ALL_MUNICIPALITIES;

// Every other column in the Municipal tab is a calendar year.
const META_COLUMNS = new Set(['section', 'measure', 'municipality', 'basis', 'note']);

const TOTAL_REVENUES = 'Total revenues';
const TOTAL_EXPENDITURES = 'Expenditures excluding other financing uses';
const POPULATION = 'Population';
const TOTAL_TAXES = 'Total taxes';
const TAXES_PER_RESIDENT = 'Taxes per resident';
const REVENUES_PER_RESIDENT = 'Revenues per resident';
const EXPENDITURES_PER_RESIDENT = 'Expenditures per resident';
const TOTAL_DEBT = 'Total debt';
const DEBT_BREAKDOWN = [
  'General obligation bonds & notes',
  'Revenue bonds & notes',
  'Lease rental debt',
  'Other debt',
  'Principal paid during year',
];
const FUND_BALANCE = 'Fund balance / retained earnings at Dec. 31 (all funds)';

// Groupings for the all-municipalities view. `measures: null` takes every
// measure in the section not claimed by another group. Colors are seg_c1–c6,
// with c6 always "other".
const REVENUE_GROUPS = [
  { label: 'Taxes', color: 'c1', measures: ['Taxes'] },
  {
    label: 'Intergovernmental',
    color: 'c2',
    measures: ['Federal government', 'State government', 'Other local governments'],
  },
  {
    label: 'Charges for services',
    color: 'c3',
    measures: [
      'Sewer charges',
      'Solid waste charges',
      'Parking',
      'Culture & recreation charges',
      'Other charges for services',
      'Water charges',
      'Electric charges',
      'Gas charges',
    ],
  },
  { label: 'Other revenue', color: 'c6', measures: null },
];
const SPENDING_GROUPS = [
  {
    label: 'Public safety',
    color: 'c1',
    measures: ['Police', 'Fire', 'Building codes & code enforcement', 'Other public safety'],
  },
  {
    label: 'Public works',
    color: 'c2',
    measures: ['Highways & streets', 'Sewer', 'Water', 'Solid waste', 'Other public works'],
  },
  { label: 'General government', color: 'c3', measures: ['General government'] },
  { label: 'Parks, recreation & libraries', color: 'c4', measures: ['Culture & recreation', 'Libraries'] },
  { label: 'Debt service', color: 'c5', measures: ['Debt service'] },
  { label: 'Other', color: 'c6', measures: null },
];
const SEG_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

// "25,097", "-1.2", " 62 " -> number. Blank or non-numeric -> null (never 0).
function parseNum(value) {
  const cleaned = String(value ?? '').replace(/[$,%]/g, '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function sign(n) {
  return n < 0 ? '-' : '';
}

// $25,097
function formatDollars(n) {
  if (n === null) return '—';
  return `${sign(n)}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
}

// $4.2M for a million or more, otherwise whole dollars.
function formatMoney(n) {
  if (n === null) return '—';
  if (Math.abs(n) < 1e6) return formatDollars(n);
  const m = Math.abs(n) / 1e6;
  return `${sign(n)}$${m.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
}

function formatCount(n) {
  return n === null ? '—' : Math.round(n).toLocaleString('en-US');
}

function formatPct(n) {
  return n === null
    ? '—'
    : `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

// Population is a count; per-resident measures are whole dollars; the rest are money.
function formatterFor(measure) {
  if (measure === POPULATION) return formatCount;
  if (/per resident/i.test(measure)) return formatDollars;
  return formatMoney;
}

function sumOrNull(values) {
  const present = values.filter((v) => v !== null);
  return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

function divideOrNull(n, d) {
  return n === null || d === null || d === 0 ? null : n / d;
}

function share(part, total) {
  return part === null || total === null || total === 0 ? null : (part / total) * 100;
}

// Distinct non-blank values in first-seen order, so the sheet controls ordering.
function uniqueValues(rows, key) {
  const seen = new Set();
  rows.forEach((row) => {
    const v = row[key];
    if (v) seen.add(v);
  });
  return [...seen];
}

// Highest to lowest, missing values last.
function byValueDesc(a, b) {
  if (a.value === null) return b.value === null ? 0 : 1;
  if (b.value === null) return -1;
  return b.value - a.value;
}

// Which year cells a row note refers to: an explicit "X through Y" range, else
// the first year mentioned. An empty result marks the row label instead.
function noteYears(note, years) {
  const range = note.match(/\b(\d{4})\s*(?:through|to|–|-)\s*(\d{4})\b/);
  if (range) return years.filter((y) => y >= range[1] && y <= range[2]);
  const first = note.match(/\b\d{4}\b/);
  return first && years.includes(first[0]) ? [first[0]] : [];
}

// Lookup helpers over the wide Municipal tab.
function useMunicipalData(rows) {
  return useMemo(() => {
    const years = rows.length
      ? Object.keys(rows[0])
          .filter((k) => k && !META_COLUMNS.has(k))
          .sort((a, b) => a.localeCompare(b))
      : [];
    const index = new Map(rows.map((r) => [`${r.section}|${r.measure}|${r.municipality}`, r]));
    const row = (section, measure, municipality) => index.get(`${section}|${measure}|${municipality}`);
    const val = (section, measure, municipality, year) => {
      const r = row(section, measure, municipality);
      return r ? parseNum(r[year]) : null;
    };
    // First section that has this measure, for measures the page names directly.
    const sectionOf = new Map();
    rows.forEach((r) => {
      if (!sectionOf.has(r.measure)) sectionOf.set(r.measure, r.section);
    });
    const valOf = (measure, municipality, year) =>
      sectionOf.has(measure) ? val(sectionOf.get(measure), measure, municipality, year) : null;
    const sectionRows = (section, measures) =>
      rows.filter((r) => r.section === section && (!measures || measures.includes(r.measure)));
    const measuresIn = (section) => uniqueValues(sectionRows(section), 'measure');
    // Years where any matching row has a value, oldest first.
    const yearsWithData = (section, measures, municipality) => {
      const matching = sectionRows(section, measures).filter(
        (r) => !municipality || r.municipality === municipality
      );
      return years.filter((y) => matching.some((r) => parseNum(r[y]) !== null));
    };
    const municipalities = [...new Set([...MUNICIPALITIES, ...uniqueValues(rows, 'municipality')])];
    const dataYears = years.filter((y) => rows.some((r) => parseNum(r[y]) !== null));
    return {
      years,
      dataYears,
      row,
      val,
      valOf,
      sectionOf,
      sectionRows,
      measuresIn,
      yearsWithData,
      municipalities,
    };
  }, [rows]);
}

function OptionButtons({ id, label, options, value, onChange }) {
  return (
    <div className={styles.filter}>
      <div className={styles.filterLabel} id={id}>{label}</div>
      <div className={styles.filterGroup} role="group" aria-labelledby={id}>
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
              aria-pressed={active}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`}>
      <h2 className={styles.sectionHeading} id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

function Legend({ items }) {
  return (
    <div className={styles.legend} aria-hidden="true">
      {items.map((item) => (
        <span key={item.label} className={styles.legendItem}>
          <span className={item.swatch} /> {item.label}
        </span>
      ))}
    </div>
  );
}

function Notes({ children }) {
  return (
    <div className={styles.notes}>
      <p>{children}</p>
    </div>
  );
}

// Horizontal bars; `highlight` items are drawn gold, others navy.
function HBars({ title, items, format, gutter = '3.5rem', legend }) {
  const max = Math.max(...items.map((d) => d.value ?? 0), 0);
  const scale = (n) => (max > 0 ? (Math.max(n, 0) / max) * 100 : 0);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {legend && <Legend items={legend} />}

      {/* Visual only; the table below carries the same numbers for assistive tech. */}
      <div className={styles.hChart} style={{ '--gutter': gutter }} aria-hidden="true">
        {items.map((d) => (
          <div key={d.name} className={styles.hRow}>
            <div className={styles.hLabel}>
              <span className={d.bold ? styles.hLabelWcasd : ''}>{d.name}</span>
            </div>
            <div className={styles.hPlot}>
              <div className={styles.hPlotArea}>
                {d.value !== null && (
                  <div
                    className={`${styles.hBar} ${d.highlight ? styles.hBarWcasd : styles.hBarPeer}`}
                    style={{ width: `${scale(d.value)}%` }}
                  />
                )}
                <span className={styles.hValue} style={{ left: d.value !== null ? `${scale(d.value)}%` : 0 }}>
                  {format(d)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vertical columns by year with the value above each column.
function YearColumns({ title, points, format }) {
  const max = Math.max(...points.map((p) => p.value ?? 0), 0);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>

      {/* Visual only; the table below carries the same numbers for assistive tech. */}
      <div className={styles.chart} aria-hidden="true">
        {points.map((point) => (
          <div key={point.year} className={styles.yearGroup}>
            <div className={styles.bars}>
              <div className={styles.barSlot}>
                <span className={styles.barValue}>{format(point.value)}</span>
                {point.value !== null && point.value > 0 && max > 0 && (
                  <div className={styles.bar} style={{ height: `${(point.value / max) * 90}%` }} />
                )}
              </div>
            </div>
            <div className={styles.yearLabel}>{point.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Footnote markers for rows with a non-empty note.
function useFootnotes(rows, years) {
  return useMemo(() => {
    const notes = [];
    const marks = new Map();
    rows.forEach((r) => {
      if (!r.note) return;
      notes.push({ municipality: r.municipality, text: r.note });
      marks.set(r.municipality, { n: notes.length, years: noteYears(r.note, years) });
    });
    return { notes, marks };
  }, [rows, years]);
}

function Mark({ n }) {
  return <sup className={styles.fnMark}>{n}</sup>;
}

function Footnotes({ notes }) {
  if (notes.length === 0) return null;
  return (
    <div className={styles.footnotes}>
      {notes.map((note, i) => (
        <p key={i}>
          <sup>{i + 1}</sup> {note.municipality}: {note.text}
        </p>
      ))}
    </div>
  );
}

// Measures (rows) × years for the selected municipality.
function MeasureYearTable({ data, caption, section, measures, municipality, years }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Measure</th>
            {years.map((year) => (
              <th key={year} scope="col">{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {measures.map((measure) => {
            const format = formatterFor(measure);
            return (
              <tr key={measure}>
                <th scope="row">{measure}</th>
                {years.map((year) => (
                  <td key={year}>{format(data.val(section, measure, municipality, year))}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// All municipalities (rows) × years for one measure, selected row highlighted.
function MunicipalityYearTable({ data, caption, section, measure, years, selected, footnotes, extra }) {
  const format = formatterFor(measure);
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Municipality</th>
            {years.map((year) => (
              <th key={year} scope="col">{year}</th>
            ))}
            {extra && <th scope="col">{extra.label}</th>}
          </tr>
        </thead>
        <tbody>
          {data.municipalities.map((name) => {
            const mark = footnotes?.marks.get(name);
            return (
              <tr key={name} className={name === selected ? styles.rowSelected : ''}>
                <th scope="row">
                  {name}
                  {mark && mark.years.length === 0 && <Mark n={mark.n} />}
                </th>
                {years.map((year) => (
                  <td key={year}>
                    {format(data.val(section, measure, name, year))}
                    {mark?.years.includes(year) && <Mark n={mark.n} />}
                  </td>
                ))}
                {extra && <td>{extra.format(extra.value(name))}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Bars plus an amount/share table for one section, selected municipality and
// year. 0 and blank measures are skipped; shares are of the bars' sum.
function reportedItems(data, section, municipality, year, exclude = []) {
  return data
    .measuresIn(section)
    .filter((m) => !exclude.includes(m))
    .map((m) => ({ name: m, value: data.val(section, m, municipality, year) }))
    .filter((d) => d.value !== null && d.value !== 0)
    .sort(byValueDesc);
}

function SharePanel({ data, section, exclude, municipality, year, chartTitle, caption }) {
  const items = reportedItems(data, section, municipality, year, exclude);
  if (items.length === 0) return null;

  const total = items.reduce((sum, d) => sum + d.value, 0);
  const withShares = items.map((d) => ({ ...d, pct: share(d.value, total), highlight: false }));

  return (
    <>
      <HBars
        title={chartTitle}
        items={withShares}
        gutter="7.5rem"
        format={(d) => `${formatMoney(d.value)} · ${formatPct(d.pct)}`}
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Amount</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {withShares.map((d) => (
              <tr key={d.name}>
                <th scope="row">{d.name}</th>
                <td>{formatMoney(d.value)}</td>
                <td>{formatPct(d.pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OverviewSection({ data, municipality, year }) {
  const tiles = [TOTAL_REVENUES, TOTAL_EXPENDITURES, POPULATION].map((measure) => ({
    measure,
    value: data.valOf(measure, municipality, year),
  }));
  const hasTiles = tiles.some((t) => t.value !== null);
  const measures = data.measuresIn('summary');
  const years = data.yearsWithData('summary', measures, municipality);
  if (!hasTiles && years.length === 0) return null;

  return (
    <Section id="overview" title="Overview">
      {hasTiles && (
        <div className={styles.stats}>
          {tiles.map((t) => (
            <div key={t.measure} className={styles.stat}>
              <div className={styles.statLabel}>{t.measure} · {year}</div>
              <div className={styles.statValue}>{formatterFor(t.measure)(t.value)}</div>
            </div>
          ))}
        </div>
      )}
      {years.length > 0 && (
        <MeasureYearTable
          data={data}
          caption={`${municipality} · summary`}
          section="summary"
          measures={measures}
          municipality={municipality}
          years={years}
        />
      )}
    </Section>
  );
}

function RevenueSection({ data, municipality, year }) {
  if (
    reportedItems(data, 'revenue', municipality, year).length === 0 &&
    reportedItems(data, 'taxes', municipality, year, [TOTAL_TAXES]).length === 0
  ) {
    return null;
  }

  return (
    <Section id="revenue" title="Where the money comes from">
      <SharePanel
        data={data}
        section="revenue"
        municipality={municipality}
        year={year}
        chartTitle={`${municipality} · Revenue by source · ${year}`}
        caption={`Revenue by source · ${year}`}
      />
      <SharePanel
        data={data}
        section="taxes"
        exclude={[TOTAL_TAXES]}
        municipality={municipality}
        year={year}
        chartTitle={`${municipality} · Taxes by type · ${year}`}
        caption={`Taxes by type · ${year}`}
      />
      <Notes>
        Revenue excludes other financing sources (borrowing and transfers between the
        municipality&apos;s own funds), shown in the overview table.
      </Notes>
    </Section>
  );
}

function SpendingSection({ data, municipality, year }) {
  const allMeasures = data.measuresIn('spending');
  const years = data.yearsWithData('spending', allMeasures, municipality);
  if (years.length === 0) return null;

  // Table rows follow the chart (largest first in the selected year), then any
  // measure with no amount that year, in sheet order.
  const ranked = reportedItems(data, 'spending', municipality, year).map((d) => d.name);
  const tableMeasures = [
    ...ranked,
    ...allMeasures.filter(
      (m) => !ranked.includes(m) && years.some((y) => data.val('spending', m, municipality, y) !== null)
    ),
  ];

  return (
    <Section id="spending" title="What the money is spent on">
      <SharePanel
        data={data}
        section="spending"
        municipality={municipality}
        year={year}
        chartTitle={`${municipality} · Spending by category · ${year}`}
        caption={`Spending by category · ${year}`}
      />
      <MeasureYearTable
        data={data}
        caption={`${municipality} · spending by year`}
        section="spending"
        measures={tableMeasures}
        municipality={municipality}
        years={years}
      />
      <Notes>
        Spending excludes other financing uses (mainly transfers between the municipality&apos;s own
        funds). Capital projects and debt refinancing can cause large changes from one year to the
        next.
      </Notes>
    </Section>
  );
}

function CompareSection({ data, municipality, year }) {
  const all = municipality === ALL_MUNICIPALITIES;
  const items = data.municipalities
    .map((name) => ({
      name,
      value: data.valOf(TAXES_PER_RESIDENT, name, year),
      highlight: name === municipality,
      bold: name === municipality,
    }))
    .sort(byValueDesc);
  if (items.every((d) => d.value === null)) return null;

  const taxTypes = data.measuresIn('taxes').filter((m) => m !== TOTAL_TAXES);
  const columns = [
    POPULATION,
    TAXES_PER_RESIDENT,
    REVENUES_PER_RESIDENT,
    EXPENDITURES_PER_RESIDENT,
    ...taxTypes.map((m) => ({ measure: m, section: 'taxes' })),
  ].map((c) => (typeof c === 'string' ? { measure: c, section: data.sectionOf.get(c) } : c));
  const cell = (c, name) => (c.section ? data.val(c.section, c.measure, name, year) : null);

  return (
    <Section id="compare" title={all ? 'Taxes per resident and tax mix' : 'Compare municipalities'}>
      <HBars
        title={`${TAXES_PER_RESIDENT} · ${year}`}
        items={items}
        gutter="4rem"
        format={(d) => formatDollars(d.value)}
        legend={
          all
            ? null
            : [
                { label: municipality, swatch: `${styles.swatch} ${styles.swatchWcasd}` },
                { label: 'Other municipalities', swatch: `${styles.swatch} ${styles.swatchPeer}` },
              ]
        }
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>Municipalities compared · {year}</caption>
          <thead>
            <tr>
              <th scope="col">Municipality</th>
              {columns.map((c) => (
                <th key={c.measure} scope="col">{c.measure}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.name} className={d.name === municipality ? styles.rowSelected : ''}>
                <th scope="row">{d.name}</th>
                {columns.map((c) => (
                  <td key={c.measure}>{formatterFor(c.measure)(cell(c, d.name))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {all && taxTypes.length > 0 && (
        <GroupedShares
          data={data}
          section="taxes"
          groups={taxTypes.map((m, i) => ({
            label: m,
            measures: [m],
            color: SEG_COLORS[Math.min(i, SEG_COLORS.length - 1)],
          }))}
          year={year}
          chartTitle={`Tax mix · ${year}`}
          caption={`Share of taxes by type · ${year}`}
        />
      )}
      <Notes>
        Per-resident figures are published by DCED and use a fixed population (the 2020 Census from
        2021 on). Municipalities provide different services — for example, some have their own police
        department or sewer system and others do not — so per-resident amounts are not like-for-like.
      </Notes>
    </Section>
  );
}

function DebtSection({ data, municipality, year }) {
  const years = data.yearsWithData('debt', [TOTAL_DEBT]);
  const ownYears = data.yearsWithData('debt', [TOTAL_DEBT], municipality);
  const breakdownYears = data.yearsWithData('debt', DEBT_BREAKDOWN, municipality);
  const breakdown = DEBT_BREAKDOWN.filter((m) =>
    breakdownYears.some((y) => data.val('debt', m, municipality, y) !== null)
  );
  if (years.length === 0 && breakdownYears.length === 0) return null;

  return (
    <Section id="debt" title="Debt">
      {ownYears.length > 0 && (
        <YearColumns
          title={`${municipality} · ${TOTAL_DEBT}`}
          points={ownYears.map((y) => ({ year: y, value: data.val('debt', TOTAL_DEBT, municipality, y) }))}
          format={formatMoney}
        />
      )}
      {years.length > 0 && (
        <MunicipalityYearTable
          data={data}
          caption={`${TOTAL_DEBT} by municipality`}
          section="debt"
          measure={TOTAL_DEBT}
          years={years}
          selected={municipality}
          extra={
            municipality === ALL_MUNICIPALITIES
              ? {
                  label: `${TOTAL_DEBT} per resident, ${year} (calculated)`,
                  format: formatDollars,
                  value: (name) =>
                    divideOrNull(data.val('debt', TOTAL_DEBT, name, year), data.valOf(POPULATION, name, year)),
                }
              : null
          }
        />
      )}
      {breakdown.length > 0 && (
        <MeasureYearTable
          data={data}
          caption={`${municipality} · debt by type`}
          section="debt"
          measures={breakdown}
          municipality={municipality}
          years={breakdownYears}
        />
      )}
    </Section>
  );
}

function FundBalanceSection({ data, municipality }) {
  const years = data.yearsWithData('fund_balance', [FUND_BALANCE]);
  const footnotes = useFootnotes(data.sectionRows('fund_balance', [FUND_BALANCE]), years);
  if (years.length === 0) return null;

  return (
    <Section id="fund-balance" title="Fund balance">
      <MunicipalityYearTable
        data={data}
        caption={`${FUND_BALANCE} by municipality`}
        section="fund_balance"
        measure={FUND_BALANCE}
        years={years}
        selected={municipality}
        footnotes={footnotes}
      />
      <Footnotes notes={footnotes.notes} />
      <Notes>
        Year-end balances across all of the municipality&apos;s funds as reported to DCED, including
        enterprise funds such as sewer or parking.
      </Notes>
    </Section>
  );
}

// Sums a section's measures into groups for one municipality and year.
function groupAmounts(data, section, groups, name, year) {
  const measures = data.measuresIn(section);
  const claimed = new Set(groups.flatMap((g) => g.measures ?? []));
  return groups.map((g) => {
    const members = g.measures
      ? g.measures.filter((m) => measures.includes(m))
      : measures.filter((m) => !claimed.has(m));
    return sumOrNull(members.map((m) => data.val(section, m, name, year)));
  });
}

function segClass(color) {
  return styles[`seg_${color}`];
}

// One 100% stacked bar per municipality, plus the shares as a table.
function GroupedShares({ data, section, groups, year, chartTitle, caption }) {
  const rows = data.municipalities.map((name) => {
    const amounts = groupAmounts(data, section, groups, name, year);
    const total = sumOrNull(amounts);
    return { name, shares: amounts.map((v) => share(v, total)) };
  });
  if (rows.every((r) => r.shares.every((s) => s === null))) return null;

  return (
    <>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>{chartTitle}</h3>
        <Legend
          items={groups.map((g) => ({
            label: g.label,
            swatch: `${styles.swatch} ${styles.segSwatch} ${segClass(g.color)}`,
          }))}
        />

        {/* Visual only; the table below carries the same numbers for assistive tech. */}
        <div className={styles.shareChart} aria-hidden="true">
          {rows.map((r) => (
            <div key={r.name} className={styles.shareRow}>
              <div className={styles.shareLabel}>{r.name}</div>
              <div className={styles.shareBar}>
                {r.shares.map((s, i) =>
                  s !== null && s > 0 ? (
                    <div
                      key={groups[i].label}
                      className={`${styles.shareSeg} ${segClass(groups[i].color)}`}
                      style={{ width: `${s}%` }}
                    >
                      {s >= 12 && formatPct(s)}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Municipality</th>
              {groups.map((g) => (
                <th key={g.label} scope="col">{g.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                {r.shares.map((s, i) => (
                  <td key={groups[i].label}>{formatPct(s)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Every measure in a section (rows) × municipalities, for one year.
function MeasureMunicipalityTable({ data, caption, section, year, value, format }) {
  const measures = data
    .measuresIn(section)
    .filter((m) => data.municipalities.some((name) => data.val(section, m, name, year) !== null));
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {data.municipalities.map((name) => (
              <th key={name} scope="col">{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {measures.map((m) => (
            <tr key={m}>
              <th scope="row">{m}</th>
              {data.municipalities.map((name) => (
                <td key={name}>{format(value(m, name))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Share of a section's total for one measure and municipality.
function measureShare(data, section, measure, name, year) {
  const total = sumOrNull(data.measuresIn(section).map((m) => data.val(section, m, name, year)));
  return share(data.val(section, measure, name, year), total);
}

function AllOverviewSection({ data, year }) {
  const columns = [
    POPULATION,
    TOTAL_REVENUES,
    TOTAL_EXPENDITURES,
    TAXES_PER_RESIDENT,
    REVENUES_PER_RESIDENT,
    EXPENDITURES_PER_RESIDENT,
  ];
  const hasData = data.municipalities.some((name) =>
    columns.some((m) => data.valOf(m, name, year) !== null)
  );
  if (!hasData) return null;

  return (
    <Section id="overview" title="Overview">
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>All municipalities · {year}</caption>
          <thead>
            <tr>
              <th scope="col">Municipality</th>
              {columns.map((m) => (
                <th key={m} scope="col">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.municipalities.map((name) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                {columns.map((m) => (
                  <td key={m}>{formatterFor(m)(data.valOf(m, name, year))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

const REVENUE_VIEWS = ['Grouped', 'All categories'];

function AllRevenueSection({ data, year }) {
  const [view, setView] = useState(REVENUE_VIEWS[0]);
  if (data.yearsWithData('revenue').length === 0) return null;

  return (
    <Section id="revenue" title="Where the money comes from">
      <GroupedShares
        data={data}
        section="revenue"
        groups={REVENUE_GROUPS}
        year={year}
        chartTitle={`Revenue by source · ${year}`}
        caption={`Share of revenue by group · ${year}`}
      />
      <div className={styles.filters}>
        <OptionButtons id="revenue-view" label="Categories" options={REVENUE_VIEWS} value={view} onChange={setView} />
      </div>
      {view === 'All categories' && (
        <MeasureMunicipalityTable
          data={data}
          caption={`Share of revenue by category · ${year}`}
          section="revenue"
          year={year}
          value={(m, name) => measureShare(data, 'revenue', m, name, year)}
          format={formatPct}
        />
      )}
      <Notes>
        We grouped these categories from DCED&apos;s reported categories.
        Percentages are of revenue excluding other financing sources.
      </Notes>
    </Section>
  );
}

const SPENDING_DETAIL_VIEWS = ['% of spending', 'Per resident'];

function AllSpendingSection({ data, year }) {
  const [view, setView] = useState(SPENDING_DETAIL_VIEWS[0]);
  if (data.yearsWithData('spending').length === 0) return null;
  const perResident = view === 'Per resident';

  return (
    <Section id="spending" title="What the money is spent on">
      <GroupedShares
        data={data}
        section="spending"
        groups={SPENDING_GROUPS}
        year={year}
        chartTitle={`Spending by category · ${year}`}
        caption={`Share of spending by group · ${year}`}
      />
      <div className={styles.filters}>
        <OptionButtons
          id="spending-detail-view"
          label="Detail"
          options={SPENDING_DETAIL_VIEWS}
          value={view}
          onChange={setView}
        />
      </div>
      <MeasureMunicipalityTable
        data={data}
        caption={`Spending by category · ${view} · ${year}`}
        section="spending"
        year={year}
        value={(m, name) =>
          perResident
            ? divideOrNull(data.val('spending', m, name, year), data.valOf(POPULATION, name, year))
            : measureShare(data, 'spending', m, name, year)
        }
        format={perResident ? formatDollars : formatPct}
      />
      <Notes>
        We grouped these categories from DCED&apos;s reported categories.
        Percentages are of spending excluding other financing uses. We calculated per-resident amounts by
        category using DCED&apos;s population figure; DCED publishes only
        total taxes, revenues, and expenditures per resident.
      </Notes>
    </Section>
  );
}

export default function MunicipalFinancesClient({ dataNote, rows = [] }) {
  const data = useMunicipalData(rows);
  const [municipality, setMunicipality] = useState(DEFAULT_MUNICIPALITY);
  const [year, setYear] = useState('');
  const years = data.dataYears;
  const activeYear = years.includes(year) ? year : years[years.length - 1] ?? '';
  const activeMunicipality =
    municipality === ALL_MUNICIPALITIES || data.municipalities.includes(municipality)
      ? municipality
      : DEFAULT_MUNICIPALITY;
  const all = activeMunicipality === ALL_MUNICIPALITIES;

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Finances</div>
          <h1 className={styles.heading}>Municipal Financials</h1>
          <p className={styles.intro}>
            Revenues, spending, debt, and fund balances for West Chester Borough and the townships in
            the West Chester Area School District, as reported by each municipality to the Pennsylvania
            Department of Community and Economic Development (DCED).
          </p>
          {dataNote}
          <p className={styles.heroNotes}>
            Figures are for calendar years (January–December). They cover all of a municipality&apos;s
            funds, including enterprise funds such as sewer and parking. Thornbury Township in Chester
            County and Thornbury Township in Delaware County are separate municipalities.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        {years.length === 0 ? (
          <p className={styles.emptyText}>
            Municipal finance data isn&apos;t available right now. Check back soon.
          </p>
        ) : (
          <>
            <div className={styles.filters}>
              <div className={styles.filter}>
                <label className={styles.filterLabel} htmlFor="municipality">Municipality</label>
                <select
                  id="municipality"
                  className={styles.select}
                  value={activeMunicipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                >
                  {[ALL_MUNICIPALITIES, ...data.municipalities].map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <OptionButtons id="year" label="Year" options={years} value={activeYear} onChange={setYear} />
            </div>

            {all ? (
              <>
                <AllOverviewSection data={data} year={activeYear} />
                <AllRevenueSection data={data} year={activeYear} />
                <AllSpendingSection data={data} year={activeYear} />
              </>
            ) : (
              <>
                <OverviewSection data={data} municipality={activeMunicipality} year={activeYear} />
                <RevenueSection data={data} municipality={activeMunicipality} year={activeYear} />
                <SpendingSection data={data} municipality={activeMunicipality} year={activeYear} />
              </>
            )}
            <CompareSection data={data} municipality={activeMunicipality} year={activeYear} />
            <DebtSection data={data} municipality={activeMunicipality} year={activeYear} />
            <FundBalanceSection data={data} municipality={activeMunicipality} />

            <section className={styles.sources} aria-labelledby="municipal-sources">
              <h2 className={styles.sourcesHeading} id="municipal-sources">Sources</h2>
              <p>
                Source: Pennsylvania Department of Community and Economic Development (DCED),{' '}
                <a
                  className={styles.sourceLink}
                  href="https://apps.dced.pa.gov/munstats-public/ReportInformation2.aspx?report=StatewideMuniAfr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Municipal Statistics
                </a>{' '}
                — Statewide Municipal Annual Financial Reports, 2020 through 2024, compiled from each
                municipality&apos;s Annual Audit and Financial Report (DCED-CLGS-30). We calculated
                expenditures excluding other financing uses from DCED&apos;s figures. Category
                groupings and per-resident amounts by category are ones we calculated.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
