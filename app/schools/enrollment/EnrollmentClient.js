'use client';

import { useMemo, useState } from 'react';
import styles from './enrollment.module.css';

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

const PROGRAM_ORDER = ['Economically disadvantaged', 'English learners', 'Special education'];

const STAFFING_METRICS = [
  { key: 'classroom_teachers', label: 'Classroom teachers', isCount: true },
  { key: 'professional_staff', label: 'Professional staff', isCount: true },
  { key: 'teacher_avg_years_experience', label: "Teachers' average years of experience", isCount: false },
  { key: 'students_per_teacher_calc', label: 'Students per teacher (calculated)', isCount: false },
];

// "11,987", "62.3%", " 62 " -> number. Blank or non-numeric values (PDE
// suppresses small groups with markers like "*" or "<5") -> null.
function parseNum(value) {
  const cleaned = String(value ?? '').replace(/[,%]/g, '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatCount(n) {
  return n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function formatDecimal(n) {
  return n === null
    ? '—'
    : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatPct(n) {
  return n === null ? '—' : `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
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

// School years like "2025-26" sort correctly as strings.
function sortedYears(rows) {
  return uniqueValues(rows, 'year').sort((a, b) => a.localeCompare(b));
}

// Known districts first (WCASD leading), then any others in the sheet.
function districtNames(rows) {
  return [...new Set([...DISTRICTS, ...uniqueValues(rows, 'district')])].filter((d) => d !== STATE);
}

// Returns `value` if it's a valid option, otherwise the preferred fallback
// (when present) or the first option.
function pick(value, options, preferred) {
  if (options.includes(value)) return value;
  if (preferred && options.includes(preferred)) return preferred;
  return options[0] ?? '';
}

// Most recent year in `years` where `getValue` yields a number for any row.
function latestYearWithData(years, rows, getValue) {
  const withData = years.filter((y) => rows.some((r) => r.year === y && getValue(r) !== null));
  return withData[withData.length - 1] ?? years[years.length - 1];
}

// Highest to lowest, missing values last.
function byValueDesc(a, b) {
  if (a.value === null) return b.value === null ? 0 : 1;
  if (b.value === null) return -1;
  return b.value - a.value;
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

// Horizontal bar chart of districts (WCASD highlighted) with an optional
// Pennsylvania reference line, followed by a table with the same numbers.
function DistrictBars({ title, columnLabel, districts, reference, format }) {
  const values = districts.map((d) => d.value).filter((v) => v !== null);
  if (reference !== null) values.push(reference);
  const max = Math.max(...values, 0);
  const scale = (n) => (max > 0 ? (Math.max(n, 0) / max) * 100 : 0);

  return (
    <>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchWcasd}`} /> West Chester Area
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchPeer}`} /> Other districts
          </span>
          {reference !== null && (
            <span className={styles.legendItem}>
              <span className={styles.swatchRef} /> Pennsylvania
            </span>
          )}
        </div>

        {/* Visual only; the table below carries the same numbers for assistive tech. */}
        <div
          className={`${styles.hChart} ${reference !== null ? styles.hChartWithRef : ''}`}
          style={reference !== null ? { '--pa': scale(reference) } : undefined}
          aria-hidden="true"
        >
          {reference !== null && (
            <>
              <span className={styles.refLabel}>PA {format(reference)}</span>
              <span className={styles.refLine} />
            </>
          )}
          {districts.map((d) => (
            <div key={d.name} className={styles.hRow}>
              <div className={styles.hLabel}>
                <span className={d.name === WCASD_DISTRICT ? styles.hLabelWcasd : ''}>{d.name}</span>
              </div>
              <div className={styles.hPlot}>
                <div className={styles.hPlotArea}>
                  {d.value !== null && (
                    <div
                      className={`${styles.hBar} ${d.name === WCASD_DISTRICT ? styles.hBarWcasd : styles.hBarPeer}`}
                      style={{ width: `${scale(d.value)}%` }}
                    />
                  )}
                  <span
                    className={styles.hValue}
                    style={{ left: d.value !== null ? `${scale(d.value)}%` : 0 }}
                  >
                    {format(d.value)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>{title}</caption>
          <thead>
            <tr>
              <th scope="col">District</th>
              <th scope="col">{columnLabel}</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((d) => (
              <tr key={d.name}>
                <th scope="row">{d.name}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
            {reference !== null && (
              <tr>
                <th scope="row">Pennsylvania</th>
                <td>{format(reference)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EnrollmentSection({ rows }) {
  const years = useMemo(() => sortedYears(rows), [rows]);
  const districts = useMemo(() => districtNames(rows), [rows]);

  const valueFor = (district, year) => {
    const match = rows.find((r) => r.district === district && r.year === year);
    return match ? parseNum(match.enrollment) : null;
  };

  const series = years.map((year) => ({ year, value: valueFor(WCASD_DISTRICT, year) }));
  const max = Math.max(...series.map((p) => p.value ?? 0), 0);
  const hasState = rows.some((r) => r.district === STATE);

  return (
    <section className={styles.section} aria-labelledby="enrollment-heading">
      <h2 className={styles.sectionHeading} id="enrollment-heading">Enrollment</h2>

      {max > 0 && (
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>WCASD total enrollment by school year</h3>

          {/* Visual only; the table below carries the same numbers for assistive tech. */}
          <div className={styles.chart} aria-hidden="true">
            {series.map((point) => (
              <div key={point.year} className={styles.yearGroup}>
                <div className={styles.bars}>
                  <div className={styles.barSlot}>
                    <span className={styles.barValue}>{formatCount(point.value)}</span>
                    {point.value !== null && (
                      <div
                        className={styles.bar}
                        style={{ height: `${(Math.max(point.value, 0) / max) * 90}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className={styles.yearLabel}>{point.year}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.tableCaption}>Total enrollment by district and school year</caption>
          <thead>
            <tr>
              <th scope="col">District</th>
              {years.map((year) => (
                <th key={year} scope="col">{year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {districts.map((district) => (
              <tr key={district}>
                <th scope="row">{district}</th>
                {years.map((year) => (
                  <td key={year}>{formatCount(valueFor(district, year))}</td>
                ))}
              </tr>
            ))}
            {hasState && (
              <tr>
                <th scope="row">Pennsylvania</th>
                {years.map((year) => (
                  <td key={year}>{formatCount(valueFor(STATE, year))}</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DemographicsSection({ rows }) {
  const [measure, setMeasure] = useState('');
  const [year, setYear] = useState('');

  // Program measures in a fixed order, then race/ethnicity groups as listed in the sheet.
  const programOptions = useMemo(() => {
    const present = uniqueValues(rows.filter((r) => r.category === 'Program'), 'measure');
    return [
      ...PROGRAM_ORDER.filter((m) => present.includes(m)),
      ...present.filter((m) => !PROGRAM_ORDER.includes(m)),
    ];
  }, [rows]);
  const raceOptions = useMemo(
    () => uniqueValues(rows.filter((r) => r.category === 'Race/ethnicity'), 'measure'),
    [rows]
  );
  const measureOptions = [...programOptions, ...raceOptions];
  const activeMeasure = pick(measure, measureOptions);

  const measureRows = useMemo(() => rows.filter((r) => r.measure === activeMeasure), [rows, activeMeasure]);
  const yearOptions = useMemo(() => sortedYears(measureRows), [measureRows]);
  const latestYear = useMemo(
    () => latestYearWithData(yearOptions, measureRows, (r) => parseNum(r.pct)),
    [yearOptions, measureRows]
  );
  const activeYear = pick(year, yearOptions, latestYear);

  const districts = useMemo(
    () =>
      districtNames(rows)
        .map((name) => {
          const match = measureRows.find((r) => r.year === activeYear && r.district === name);
          return { name, value: match ? parseNum(match.pct) : null };
        })
        .sort(byValueDesc),
    [rows, measureRows, activeYear]
  );

  const stateRow = measureRows.find((r) => r.year === activeYear && r.district === STATE);
  const reference = stateRow ? parseNum(stateRow.pct) : null;
  const hasData = districts.some((d) => d.value !== null);

  return (
    <section className={styles.section} aria-labelledby="demographics-heading">
      <h2 className={styles.sectionHeading} id="demographics-heading">Student demographics</h2>

      <div className={styles.filters}>
        <div className={styles.filter}>
          <label className={styles.filterLabel} htmlFor="demographics-measure">Measure</label>
          <select
            id="demographics-measure"
            className={styles.select}
            value={activeMeasure}
            onChange={(e) => setMeasure(e.target.value)}
          >
            {programOptions.length > 0 && (
              <optgroup label="Program">
                {programOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
            )}
            {raceOptions.length > 0 && (
              <optgroup label="Race/ethnicity">
                {raceOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        {yearOptions.length > 0 && (
          <OptionButtons
            id="demographics-year"
            label="Year"
            options={yearOptions}
            value={activeYear}
            onChange={setYear}
          />
        )}
      </div>

      {hasData ? (
        <DistrictBars
          title={`${activeMeasure} · ${activeYear} · % of students`}
          columnLabel="% of students"
          districts={districts}
          reference={reference}
          format={formatPct}
        />
      ) : (
        <p className={styles.emptyText}>No district data for this measure and year.</p>
      )}

      <div className={styles.notes}>
        <p>
          Special education percentages are from PDE&apos;s Future Ready PA Index; a statewide
          figure on the same basis is not published. Race/ethnicity values for very small groups
          are suppressed by PDE and shown as &apos;—&apos;.
        </p>
      </div>
    </section>
  );
}

function StaffingSection({ rows }) {
  const [metricKey, setMetricKey] = useState(STAFFING_METRICS[0].key);
  const [year, setYear] = useState('');

  const metric = STAFFING_METRICS.find((m) => m.key === metricKey);
  const getValue = (r) => parseNum(r[metric.key]);

  const yearOptions = useMemo(() => sortedYears(rows), [rows]);
  const latestYear = latestYearWithData(
    yearOptions,
    rows.filter((r) => r.district !== STATE),
    getValue
  );
  const activeYear = pick(year, yearOptions, latestYear);

  const districts = districtNames(rows)
    .map((name) => {
      const match = rows.find((r) => r.year === activeYear && r.district === name);
      return { name, value: match ? getValue(match) : null };
    })
    .sort(byValueDesc);

  const stateRow = metric.isCount
    ? null
    : rows.find((r) => r.year === activeYear && r.district === STATE);
  const reference = stateRow ? getValue(stateRow) : null;
  const hasData = districts.some((d) => d.value !== null);

  return (
    <section className={styles.section} aria-labelledby="staffing-heading">
      <h2 className={styles.sectionHeading} id="staffing-heading">Staffing</h2>

      <div className={styles.filters}>
        <OptionButtons
          id="staffing-metric"
          label="Metric"
          options={STAFFING_METRICS.map((m) => ({ value: m.key, label: m.label }))}
          value={metricKey}
          onChange={setMetricKey}
        />
        {yearOptions.length > 0 && (
          <OptionButtons
            id="staffing-year"
            label="Year"
            options={yearOptions}
            value={activeYear}
            onChange={setYear}
          />
        )}
      </div>

      {hasData ? (
        <DistrictBars
          title={`${metric.label} · ${activeYear}`}
          columnLabel={metric.label}
          districts={districts}
          reference={reference}
          format={metric.isCount ? formatCount : formatDecimal}
        />
      ) : (
        <p className={styles.emptyText}>No district data for this metric and year.</p>
      )}

      <div className={styles.notes}>
        <p>
          Classroom teacher and professional staff counts include full- and part-time staff as
          reported to PDE on October 1. Average years of experience is for full-time classroom
          teachers. Students per teacher is calculated by West Chester by the Numbers as
          October 1 enrollment divided by classroom teacher count; it is not a PDE-published
          figure.
        </p>
      </div>
    </section>
  );
}

export default function EnrollmentClient({ enrollment = [], demographics = [], staffing = [] }) {
  const hasAny = enrollment.length > 0 || demographics.length > 0 || staffing.length > 0;

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Schools</div>
          <h1 className={styles.heading}>Enrollment &amp; Staffing</h1>
          <p className={styles.intro}>
            Enrollment, student demographics, and staffing for the West Chester Area School
            District, compared with similar Chester County districts and Pennsylvania statewide.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        {!hasAny ? (
          <p className={styles.emptyText}>Enrollment and staffing data isn&apos;t available right now. Check back soon.</p>
        ) : (
          <>
            {enrollment.length > 0 && <EnrollmentSection rows={enrollment} />}
            {demographics.length > 0 && <DemographicsSection rows={demographics} />}
            {staffing.length > 0 && <StaffingSection rows={staffing} />}

            <section className={styles.sources} aria-labelledby="enrollment-sources">
              <h2 className={styles.sourcesHeading} id="enrollment-sources">Sources</h2>
              <p>
                Source:{' '}
                <a
                  className={styles.sourceLink}
                  href="https://www.pa.gov/agencies/education/data-and-reporting"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pennsylvania Department of Education
                </a>{' '}
                — Public School Enrollment Reports, Public Schools Percent Low Income, English
                Learner Student Counts, Professional Staff Summary Reports, and Future Ready PA
                Index District Fast Facts, 2020-21 through 2025-26. Pennsylvania race/ethnicity
                and English learner percentages are calculated from PDE&apos;s statewide counts.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
