'use client';

import { useMemo, useState } from 'react';
import styles from './budget.module.css';

const WCASD_DISTRICT = 'West Chester Area';
const STATE = 'Pennsylvania';
const DISTRICTS = [
  'West Chester Area',
  'Downingtown Area',
  'Great Valley',
  'Owen J. Roberts',
  'Tredyffrin-Easttown',
  'Unionville-Chadds Ford',
];

// Every other column in the Budget tab is a school year.
const META_COLUMNS = new Set(['section', 'measure', 'district', 'basis', 'note']);

const REVENUE_SOURCES = [
  { measure: 'Local', className: 'segNavy' },
  { measure: 'State', className: 'segGold' },
  { measure: 'Federal', className: 'segLight' },
];
const OTHER_FINANCING = 'Other financing sources (bond proceeds, transfers)';

const SPENDING_VIEWS = [
  { value: 'function', label: 'By function', section: 'spending_function' },
  { value: 'support', label: 'Support services detail', section: 'support_services' },
  { value: 'object', label: 'By type', section: 'spending_object' },
];
const TOTAL_SPENDING = 'Total spending';

const FUNCTION_DEFINITIONS = [
  ['Instruction', 'classroom teaching and instructional programs.'],
  [
    'Support services',
    'student services, administration, operations and maintenance, transportation, and other services that support instruction.',
  ],
  ['Non-instructional services', 'student activities and community services.'],
  ['Facilities', 'acquisition and construction paid from the general fund.'],
  ['Other financing uses', 'debt service payments and transfers to other funds.'],
];

const FUND_BALANCE_PARTS = [
  { measure: 'Committed', className: 'segNavy' },
  { measure: 'Assigned', className: 'segGold' },
  { measure: 'Unassigned', className: 'segLight' },
];

const DEBT_PARTS = [
  { measure: 'General obligation bonds', className: 'segNavy' },
  { measure: 'Other borrowing', className: 'segGold' },
];
const PENSION_DEBT = 'Pension, OPEB & compensated absences';

const MILLAGE_CHESTER = 'Millage (Chester Co.)';
const MILLAGE_DELAWARE = 'Millage (Delaware Co.)';

const AID_RATIO = 'MV/PI aid ratio';
const MARKET_VALUE = 'Market value per WADM';
const PERSONAL_INCOME = 'Personal income per WADM';

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

// $313.4M
function formatMillions(n) {
  if (n === null) return '—';
  const m = Math.abs(n) / 1e6;
  return `${sign(n)}$${m.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
}

// $25,097
function formatDollars(n) {
  if (n === null) return '—';
  return `${sign(n)}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
}

function formatPct(n) {
  return n === null
    ? '—'
    : `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatMills(n) {
  return n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function formatRatio(n) {
  return n === null
    ? '—'
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
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

// Returns `value` if it's a valid option, otherwise the preferred fallback
// (when present) or the first option.
function pick(value, options, preferred) {
  if (options.includes(value)) return value;
  if (preferred && options.includes(preferred)) return preferred;
  return options[0] ?? '';
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
  const range = note.match(/(\d{4}-\d{2})\s+(?:through|to)\s+(\d{4}-\d{2})/);
  if (range) return years.filter((y) => y >= range[1] && y <= range[2]);
  const first = note.match(/\d{4}-\d{2}/);
  return first ? [first[0]] : [];
}

// Lookup helpers over the wide Budget tab.
function useBudgetData(rows) {
  return useMemo(() => {
    const years = rows.length
      ? Object.keys(rows[0])
          .filter((k) => k && !META_COLUMNS.has(k))
          .sort((a, b) => a.localeCompare(b))
      : [];
    const index = new Map(rows.map((r) => [`${r.section}|${r.measure}|${r.district}`, r]));
    const row = (section, measure, district) => index.get(`${section}|${measure}|${district}`);
    const val = (section, measure, district, year) => {
      const r = row(section, measure, district);
      return r ? parseNum(r[year]) : null;
    };
    const sectionRows = (section, measures) =>
      rows.filter((r) => r.section === section && (!measures || measures.includes(r.measure)));
    // Years where any matching row has a value, oldest first.
    const yearsWithData = (section, measures, district) => {
      const matching = sectionRows(section, measures).filter((r) => !district || r.district === district);
      return years.filter((y) => matching.some((r) => parseNum(r[y]) !== null));
    };
    const districts = [...new Set([...DISTRICTS, ...uniqueValues(rows, 'district')])].filter(
      (d) => d !== STATE
    );
    const hasState = (section) => rows.some((r) => r.section === section && r.district === STATE);
    return { years, row, val, sectionRows, yearsWithData, districts, hasState };
  }, [rows]);
}

function OptionButtons({ id, label, options, value, onChange }) {
  return (
    <div className={styles.filter}>
      <div className={styles.filterLabel} id={id}>{label}</div>
      <div className={styles.filterGroup} role="group" aria-labelledby={id}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const active = optionValue === value;
          return (
            <button
              key={optionValue}
              type="button"
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
              aria-pressed={active}
              onClick={() => onChange(optionValue)}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearButtons({ id, years, value, onChange }) {
  if (years.length === 0) return null;
  return (
    <div className={styles.filters}>
      <OptionButtons id={id} label="Year" options={years} value={value} onChange={onChange} />
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

// Round tick values spanning [min, max].
function niceTicks(min, max, count = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

// Multi-series line chart. Lines are drawn in a stretched 0–100 SVG space
// (non-scaling strokes keep widths even); text is HTML so it stays legible.
function LineChart({ title, years, series, legend, tickFormat }) {
  const values = series.flatMap((s) => s.values).filter((v) => v !== null);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const x = (i) => (years.length === 1 ? 50 : 4 + (i / (years.length - 1)) * 92);
  const y = (v) => 100 - ((v - lo) / (hi - lo)) * 100;

  // Break lines at missing years rather than drawing through them.
  const segments = (values) => {
    const out = [];
    let current = [];
    values.forEach((v, i) => {
      if (v === null) {
        if (current.length) out.push(current);
        current = [];
      } else {
        current.push(`${x(i)},${y(v)}`);
      }
    });
    if (current.length) out.push(current);
    return out;
  };

  const order = { peer: 0, state: 1, county: 1, wcasd: 2 };
  const drawn = [...series].sort((a, b) => order[a.variant] - order[b.variant]);
  const wcasd = series.find((s) => s.variant === 'wcasd');

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <Legend items={legend} />

      {/* Visual only; the table below carries the same numbers for assistive tech. */}
      <div className={styles.lineChart} aria-hidden="true">
        <div className={styles.lineYAxis}>
          {ticks.map((t) => (
            <span key={t} className={styles.lineTick} style={{ bottom: `${100 - y(t)}%` }}>
              {tickFormat(t)}
            </span>
          ))}
        </div>
        <div className={styles.linePlot}>
          {ticks.map((t) => (
            <span key={t} className={styles.lineGrid} style={{ bottom: `${100 - y(t)}%` }} />
          ))}
          <svg className={styles.lineSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            {drawn.map((s) =>
              segments(s.values).map((points, i) => (
                <polyline
                  key={`${s.name}-${i}`}
                  points={points.join(' ')}
                  className={styles[`line_${s.variant}`]}
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                />
              ))
            )}
          </svg>
          {wcasd &&
            wcasd.values.map((v, i) =>
              v === null ? null : (
                <span
                  key={years[i]}
                  className={styles.lineDot}
                  style={{ left: `${x(i)}%`, top: `${y(v)}%` }}
                />
              )
            )}
        </div>
        <div className={styles.lineXAxis}>
          {years.map((year, i) => (
            <span key={year} className={styles.lineYear} style={{ left: `${x(i)}%` }}>
              {year}
            </span>
          ))}
        </div>
      </div>
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
              <span className={d.name === WCASD_DISTRICT ? styles.hLabelWcasd : ''}>{d.name}</span>
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

// Stacked vertical columns by year with the total above each column.
function StackedColumns({ title, points, parts, legend }) {
  const totals = points.map((p) => p.parts.reduce((sum, v) => sum + Math.max(v ?? 0, 0), 0));
  const max = Math.max(...totals, 0);

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <Legend items={legend} />

      {/* Visual only; the table below carries the same numbers for assistive tech. */}
      <div className={styles.chart} aria-hidden="true">
        {points.map((point, i) => (
          <div key={point.year} className={styles.yearGroup}>
            <div className={styles.bars}>
              <div className={styles.barSlot}>
                <span className={styles.barValue}>{formatMillions(point.total)}</span>
                {totals[i] > 0 && (
                  <div className={styles.stack} style={{ height: `${(totals[i] / max) * 90}%` }}>
                    {parts.map((part, j) =>
                      point.parts[j] > 0 ? (
                        <div
                          key={part.measure}
                          className={styles[part.className]}
                          style={{ flexGrow: point.parts[j] }}
                        />
                      ) : null
                    )}
                  </div>
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
      notes.push({ district: r.district, text: r.note });
      marks.set(r.district, { n: notes.length, years: noteYears(r.note, years) });
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
          <sup>{i + 1}</sup> {note.district}: {note.text}
        </p>
      ))}
    </div>
  );
}

// Districts (and optionally Pennsylvania) × years for one measure.
function DistrictYearTable({ data, caption, section, measure, years, format, includeState, footnotes }) {
  const names = [...data.districts, ...(includeState ? [STATE] : [])];
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">District</th>
            {years.map((year) => (
              <th key={year} scope="col">{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {names.map((name) => {
            const mark = footnotes?.marks.get(name);
            return (
              <tr key={name}>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const LINE_LEGEND = [
  { label: 'West Chester Area', swatch: styles.swatchLineWcasd },
  { label: 'Other districts', swatch: styles.swatchLinePeer },
];
const LINE_LEGEND_STATE = [...LINE_LEGEND, { label: 'Pennsylvania', swatch: styles.swatchLineState }];

function lineSeries(data, section, measure, years, includeState) {
  const names = [...data.districts, ...(includeState ? [STATE] : [])];
  return names
    .map((name) => ({
      name,
      variant: name === WCASD_DISTRICT ? 'wcasd' : name === STATE ? 'state' : 'peer',
      values: years.map((y) => data.val(section, measure, name, y)),
    }))
    .filter((s) => s.values.some((v) => v !== null));
}

function PerStudentSection({ data }) {
  const measure = 'Total spending per student';
  const years = data.yearsWithData('per_student', [measure]);
  const includeState = data.hasState('per_student');
  const footnotes = useFootnotes(data.sectionRows('per_student', [measure]), years);
  if (years.length === 0) return null;

  return (
    <Section id="per-student" title="Spending per student">
      <LineChart
        title="Total spending per student"
        years={years}
        series={lineSeries(data, 'per_student', measure, years, includeState)}
        legend={includeState ? LINE_LEGEND_STATE : LINE_LEGEND}
        tickFormat={formatDollars}
      />
      <DistrictYearTable
        data={data}
        caption="Total spending per student by district"
        section="per_student"
        measure={measure}
        years={years}
        format={formatDollars}
        includeState={includeState}
        footnotes={footnotes}
      />
      <Footnotes notes={footnotes.notes} />
      <div className={styles.notes}>
        <p>
          Total spending per student is general fund total expenditures divided by average daily
          membership (ADM). PDE published this figure through 2022-23; 2023-24 and 2024-25 are
          calculated by West Chester by the Numbers using the same method from PDE&apos;s files.
          Pennsylvania is the total for all 500 school districts, calculated by West Chester by the
          Numbers.
        </p>
      </div>
    </Section>
  );
}

function RevenueSection({ data }) {
  const [year, setYear] = useState('');
  const sourceMeasures = REVENUE_SOURCES.map((s) => s.measure);
  const years = data.yearsWithData('revenue', sourceMeasures);
  const activeYear = pick(year, years, years[years.length - 1]);
  const otherYears = data.yearsWithData('revenue', [OTHER_FINANCING], WCASD_DISTRICT);
  if (years.length === 0) return null;

  const names = [...data.districts, ...(data.hasState('revenue') ? [STATE] : [])];
  const districtRows = names.map((name) => {
    const amounts = sourceMeasures.map((m) => data.val('revenue', m, name, activeYear));
    const present = amounts.filter((v) => v !== null);
    const total = present.length ? present.reduce((a, b) => a + b, 0) : null;
    return { name, amounts, shares: amounts.map((v) => share(v, total)) };
  });

  return (
    <Section id="revenue" title="Where the money comes from">
      <YearButtons id="revenue-year" years={years} value={activeYear} onChange={setYear} />

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Share of revenue by source · {activeYear}</h3>
        <Legend
          items={REVENUE_SOURCES.map((s) => ({
            label: s.measure,
            swatch: `${styles.swatch} ${styles[s.className]}`,
          }))}
        />

        {/* Visual only; the table below carries the same numbers for assistive tech. */}
        <div className={styles.shareChart} aria-hidden="true">
          {districtRows.map((d) => (
            <div
              key={d.name}
              className={`${styles.shareRow} ${d.name === WCASD_DISTRICT ? styles.shareRowWcasd : ''}`}
            >
              <div className={styles.shareLabel}>{d.name}</div>
              <div className={styles.shareBar}>
                {d.shares.map((s, i) =>
                  s !== null && s > 0 ? (
                    <div
                      key={REVENUE_SOURCES[i].measure}
                      className={`${styles.shareSeg} ${styles[REVENUE_SOURCES[i].className]}`}
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
          <caption className={styles.tableCaption}>Revenue by source · {activeYear}</caption>
          <thead>
            <tr>
              <th scope="col">District</th>
              {sourceMeasures.flatMap((m) => [
                <th key={`${m}-d`} scope="col">{m} $</th>,
                <th key={`${m}-p`} scope="col">{m} %</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {districtRows.map((d) => (
              <tr key={d.name}>
                <th scope="row">{d.name}</th>
                {sourceMeasures.flatMap((m, i) => [
                  <td key={`${m}-d`}>{formatMillions(d.amounts[i])}</td>,
                  <td key={`${m}-p`}>{formatPct(d.shares[i])}</td>,
                ])}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {otherYears.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.tableCaption}>West Chester Area · other financing sources</caption>
            <thead>
              <tr>
                <th scope="col">Measure</th>
                {years.map((y) => (
                  <th key={y} scope="col">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{OTHER_FINANCING}</th>
                {years.map((y) => (
                  <td key={y}>{formatMillions(data.val('revenue', OTHER_FINANCING, WCASD_DISTRICT, y))}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.notes}>
        <p>
          Shares are of local, state, and federal revenue. Other financing sources, mainly bond
          proceeds and transfers between district funds, are not operating revenue and are shown
          separately.
        </p>
      </div>
    </Section>
  );
}

function SpendingSection({ data }) {
  const [viewValue, setViewValue] = useState(SPENDING_VIEWS[0].value);
  const [year, setYear] = useState('');
  const view = SPENDING_VIEWS.find((v) => v.value === viewValue);

  const measures = uniqueValues(data.sectionRows(view.section), 'measure').filter(
    (m) => !(view.value === 'function' && m === TOTAL_SPENDING)
  );
  const years = data.yearsWithData(view.section, measures);
  const activeYear = pick(year, years, years[years.length - 1]);
  if (SPENDING_VIEWS.every((v) => data.yearsWithData(v.section).length === 0)) return null;

  const totalFor = (district) => {
    if (view.value !== 'support') return data.val('spending_function', TOTAL_SPENDING, district, activeYear);
    const parts = measures
      .map((m) => data.val(view.section, m, district, activeYear))
      .filter((v) => v !== null);
    return parts.length ? parts.reduce((a, b) => a + b, 0) : null;
  };

  const wcasdTotal = totalFor(WCASD_DISTRICT);
  const items = measures
    .map((m) => {
      const value = data.val(view.section, m, WCASD_DISTRICT, activeYear);
      return { name: m, value, pct: share(value, wcasdTotal), highlight: true };
    })
    .sort(byValueDesc);

  const names = [...data.districts, ...(data.hasState(view.section) ? [STATE] : [])];
  const totals = new Map(names.map((name) => [name, totalFor(name)]));
  const shareLabel = view.value === 'support' ? '% of support services' : '% of total spending';

  return (
    <Section id="spending" title="What the money is spent on">
      <div className={styles.filters}>
        <OptionButtons
          id="spending-view"
          label="View"
          options={SPENDING_VIEWS}
          value={view.value}
          onChange={setViewValue}
        />
        {years.length > 0 && (
          <OptionButtons id="spending-year" label="Year" options={years} value={activeYear} onChange={setYear} />
        )}
      </div>

      {view.value === 'function' && (
        <dl className={styles.definitions}>
          {FUNCTION_DEFINITIONS.map(([term, definition]) => (
            <div key={term}>
              <dt>{term}</dt> <dd>= {definition}</dd>
            </div>
          ))}
        </dl>
      )}

      {years.length === 0 ? (
        <p className={styles.emptyText}>No data for this view.</p>
      ) : (
        <>
          <HBars
            title={`West Chester Area · ${view.label} · ${activeYear}`}
            items={items}
            gutter="7.5rem"
            format={(d) => (d.value === null ? '—' : `${formatMillions(d.value)} · ${formatPct(d.pct)}`)}
          />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.tableCaption}>
                {shareLabel} by district · {view.label} · {activeYear}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  {names.map((name) => (
                    <th key={name} scope="col">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.name}>
                    <th scope="row">{item.name}</th>
                    {names.map((name) => (
                      <td key={name}>
                        {formatPct(share(data.val(view.section, item.name, name, activeYear), totals.get(name)))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Section>
  );
}

// West Chester Area only; WCASD sets a separate rate for each county.
const MILLAGE_COUNTIES = [
  { measure: MILLAGE_CHESTER, label: 'Chester Co.', variant: 'wcasd', swatch: styles.swatchLineWcasd },
  { measure: MILLAGE_DELAWARE, label: 'Delaware Co.', variant: 'county', swatch: styles.swatchLineCounty },
];

function formatMillsFixed(n) {
  return n === null
    ? '—'
    : n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function MillageSection({ data }) {
  const measures = MILLAGE_COUNTIES.map((c) => c.measure);
  const years = data.yearsWithData('millage', measures, WCASD_DISTRICT);
  if (years.length === 0) return null;

  const counties = MILLAGE_COUNTIES.map((c) => ({
    ...c,
    values: years.map((y) => data.val('millage', c.measure, WCASD_DISTRICT, y)),
  })).filter((c) => c.values.some((v) => v !== null));

  return (
    <Section id="millage" title="Property tax rates">
      <LineChart
        title="West Chester Area school real estate millage"
        years={years}
        series={counties.map((c) => ({ name: c.label, variant: c.variant, values: c.values }))}
        legend={counties.map((c) => ({ label: c.label, swatch: c.swatch }))}
        tickFormat={formatMills}
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>West Chester Area real estate millage by county</caption>
          <thead>
            <tr>
              <th scope="col">County</th>
              {years.map((year) => (
                <th key={year} scope="col">{year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {counties.map((c) => (
              <tr key={c.measure}>
                <th scope="row">{c.label}</th>
                {c.values.map((v, i) => (
                  <td key={years[i]}>{formatMillsFixed(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.notes}>
        <p>
          School real estate tax rates as reported to PDE. A property&apos;s tax bill is the millage
          multiplied by its assessed value, so rates alone do not show what residents pay. Chester
          County and Delaware County assess property separately, which is why WCASD sets a different
          rate in each. Delaware County&apos;s countywide reassessment took effect for the 2021-22
          school year.
        </p>
      </div>
    </Section>
  );
}

function PartsTable({ caption, firstHeader, rows, parts, format }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{firstHeader}</th>
            {parts.map((p) => (
              <th key={p.measure} scope="col">{p.measure}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {r.values.map((v, i) => (
                <td key={parts[i].measure}>{format(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function partsLegend(parts) {
  return parts.map((p) => ({ label: p.measure, swatch: `${styles.swatch} ${styles[p.className]}` }));
}

function columnPoints(data, section, parts, years) {
  return years.map((year) => {
    const values = parts.map((p) => data.val(section, p.measure, WCASD_DISTRICT, year));
    const present = values.filter((v) => v !== null);
    return {
      year,
      parts: values,
      total: present.length ? present.reduce((a, b) => a + b, 0) : null,
    };
  });
}

function FundBalanceSection({ data }) {
  const [year, setYear] = useState('');
  const measures = FUND_BALANCE_PARTS.map((p) => p.measure);
  const wcasdYears = data.yearsWithData('fund_balance', measures, WCASD_DISTRICT);
  const years = data.yearsWithData('fund_balance', measures);
  const activeYear = pick(year, years, years[years.length - 1]);
  if (years.length === 0) return null;

  const names = [...data.districts, ...(data.hasState('fund_balance') ? [STATE] : [])];

  return (
    <Section id="fund-balance" title="Fund balance">
      {wcasdYears.length > 0 && (
        <>
          <StackedColumns
            title="West Chester Area general fund balance"
            points={columnPoints(data, 'fund_balance', FUND_BALANCE_PARTS, wcasdYears)}
            parts={FUND_BALANCE_PARTS}
            legend={partsLegend(FUND_BALANCE_PARTS)}
          />
          <PartsTable
            caption="West Chester Area general fund balance by year"
            firstHeader="Year"
            parts={FUND_BALANCE_PARTS}
            format={formatMillions}
            rows={wcasdYears.map((y) => ({
              label: y,
              values: measures.map((m) => data.val('fund_balance', m, WCASD_DISTRICT, y)),
            }))}
          />
        </>
      )}

      <YearButtons id="fund-balance-year" years={years} value={activeYear} onChange={setYear} />
      <PartsTable
        caption={`General fund balance by district · ${activeYear}`}
        firstHeader="District"
        parts={FUND_BALANCE_PARTS}
        format={formatMillions}
        rows={names.map((name) => ({
          label: name,
          values: measures.map((m) => data.val('fund_balance', m, name, activeYear)),
        }))}
      />

      <div className={styles.notes}>
        <p>
          General fund balance at year end as reported to PDE. Committed amounts are set aside by
          board action; assigned amounts are intended for specific purposes; unassigned amounts are
          available for any purpose. In 2024-25, WCASD reported most of its fund balance as committed
          rather than assigned.
        </p>
      </div>
    </Section>
  );
}

function DebtSection({ data }) {
  const measures = DEBT_PARTS.map((p) => p.measure);
  const wcasdYears = data.yearsWithData('debt', measures, WCASD_DISTRICT);
  const years = data.yearsWithData('debt', measures);
  const pensionYears = data.yearsWithData('debt', [PENSION_DEBT]);
  const includeState = data.hasState('debt');
  const footnotes = useFootnotes(data.sectionRows('debt', [PENSION_DEBT]), pensionYears);
  if (years.length === 0 && pensionYears.length === 0) return null;

  return (
    <Section id="debt" title="Debt">
      {wcasdYears.length > 0 && (
        <StackedColumns
          title="West Chester Area outstanding debt"
          points={columnPoints(data, 'debt', DEBT_PARTS, wcasdYears)}
          parts={DEBT_PARTS}
          legend={partsLegend(DEBT_PARTS)}
        />
      )}

      {years.length > 0 &&
        measures.map((m) => (
          <DistrictYearTable
            key={m}
            data={data}
            caption={`${m} by district`}
            section="debt"
            measure={m}
            years={years}
            format={formatMillions}
            includeState={includeState}
          />
        ))}

      {pensionYears.length > 0 && (
        <>
          <h3 className={styles.subHeading}>Pension, retiree health (OPEB) and compensated absences</h3>
          <DistrictYearTable
            data={data}
            caption={`${PENSION_DEBT} by district`}
            section="debt"
            measure={PENSION_DEBT}
            years={pensionYears}
            format={formatMillions}
            includeState={includeState}
            footnotes={footnotes}
          />
          <Footnotes notes={footnotes.notes} />
        </>
      )}

      <div className={styles.notes}>
        <p>
          Debt is outstanding at fiscal year end for governmental funds. Other borrowing includes
          authority building obligations, leases, and other long-term debt, calculated by West Chester
          by the Numbers as total governmental debt minus bonds and pension-related liabilities.
          Pension, OPEB, and compensated absences are accounting liabilities reported separately; PDE
          combined them into one category starting in 2022-23, and earlier years are the sum of
          PDE&apos;s separate categories.
        </p>
      </div>
    </Section>
  );
}

function AidRatioSection({ data }) {
  const [year, setYear] = useState('');
  const years = data.yearsWithData('aid_ratio', [AID_RATIO]);
  const activeYear = pick(year, years, years[years.length - 1]);
  if (years.length === 0) return null;

  const items = data.districts
    .map((name) => ({
      name,
      value: data.val('aid_ratio', AID_RATIO, name, activeYear),
      highlight: name === WCASD_DISTRICT,
    }))
    .sort(byValueDesc);

  return (
    <Section id="aid-ratio" title="State aid wealth measure">
      <YearButtons id="aid-ratio-year" years={years} value={activeYear} onChange={setYear} />
      <HBars
        title={`Market value/personal income aid ratio · ${activeYear}`}
        items={items}
        format={(d) => formatRatio(d.value)}
        legend={[
          { label: 'West Chester Area', swatch: `${styles.swatch} ${styles.segGold}` },
          { label: 'Other districts', swatch: `${styles.swatch} ${styles.segNavy}` },
        ]}
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>Aid ratio and wealth per student · {activeYear}</caption>
          <thead>
            <tr>
              <th scope="col">District</th>
              <th scope="col">{AID_RATIO}</th>
              <th scope="col">{MARKET_VALUE}</th>
              <th scope="col">{PERSONAL_INCOME}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.name}>
                <th scope="row">{d.name}</th>
                <td>{formatRatio(d.value)}</td>
                <td>{formatDollars(data.val('aid_ratio', MARKET_VALUE, d.name, activeYear))}</td>
                <td>{formatDollars(data.val('aid_ratio', PERSONAL_INCOME, d.name, activeYear))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.notes}>
        <p>
          The market value/personal income aid ratio is PDE&apos;s measure of a district&apos;s local
          wealth relative to the state average, based on property values and residents&apos; income per
          student. Lower values mean more local wealth. The minimum is 0.15.
        </p>
      </div>
    </Section>
  );
}

export default function BudgetClient({ rows = [] }) {
  const data = useBudgetData(rows);
  const hasAny = data.years.some((y) => rows.some((r) => parseNum(r[y]) !== null));

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Schools</div>
          <h1 className={styles.heading}>WCASD Budget</h1>
          <p className={styles.intro}>
            Audited spending, revenue, taxes, and debt for the West Chester Area School District,
            compared with similar Chester County districts and Pennsylvania. Figures are from the
            Annual Financial Reports districts file with the Pennsylvania Department of Education.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        {!hasAny ? (
          <p className={styles.emptyText}>Budget data isn&apos;t available right now. Check back soon.</p>
        ) : (
          <>
            <PerStudentSection data={data} />
            <RevenueSection data={data} />
            <SpendingSection data={data} />
            <MillageSection data={data} />
            <FundBalanceSection data={data} />
            <DebtSection data={data} />
            <AidRatioSection data={data} />

            <section className={styles.sources} aria-labelledby="budget-sources">
              <h2 className={styles.sourcesHeading} id="budget-sources">Sources</h2>
              <p>
                Source:{' '}
                <a
                  className={styles.sourceLink}
                  href="https://www.pa.gov/agencies/education/programs-and-services/schools/grants-and-funding/school-finances"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pennsylvania Department of Education
                </a>{' '}
                — Annual Financial Report (AFR) Data: Detailed (expenditures, support services, major
                object, local, state, federal and other revenue, general fund balance, statement of
                indebtedness), Average Daily Membership, Selected Data, Aid Ratios, and Real Estate Tax
                Rates, 2020-21 through 2025-26. Figures are general fund unless noted. Pennsylvania
                totals and figures labeled calculated are by West Chester by the Numbers from PDE&apos;s
                files.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
