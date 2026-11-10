'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './community.module.css';

const ALL = 'all';
const MUNICIPALITY = 'Municipality';
const SCHOOL_DISTRICT = 'School district';
const COUNTY = 'County';
const STATE = 'State';

const SECTIONS = [
  { id: 'people', label: 'People' },
  { id: 'households-income', label: 'Households & income' },
  { id: 'housing', label: 'Housing' },
  { id: 'education-work', label: 'Education & work' },
];

// Groups whose percent measures share one universe get a bar per row.
const BAR_GROUPS = new Set([
  'Age',
  'Race and Hispanic origin',
  'Household income',
  'Type of building',
  'Year built',
  'Home value ranges',
  'Rent ranges',
  'Rent as a share of income',
  'Vehicles',
  'Commuting',
  'Class of worker',
  'Occupation',
  'Industry',
  'School enrollment',
]);
const BAR_GROUP_PREFIXES = ['Owner costs as a share of income', 'Educational attainment'];

function isBarGroup(group) {
  return BAR_GROUPS.has(group) || BAR_GROUP_PREFIXES.some((p) => group.startsWith(p));
}

// People section headline cards, by measure_id.
const HEADLINE_MEASURES = [
  'dp05_0001', // Total population
  'dp05_0018', // Median age
  'dp03_0062', // Median household income
  'dp04_0089', // Median home value
  'dp04_0134', // Median gross rent
  'dp02_0068', // Bachelor's degree or higher
];

// Above this many measures, the all-municipalities table lists measures as rows.
const MAX_MEASURE_COLUMNS = 6;

// Above this many measures, the single-municipality chart shows one measure at a time.
const MAX_GROUPED_MEASURES = 10;

// Groups whose percent measures add up to 100% of one universe get stacked share bars.
const SHARE_GROUPS = new Set([
  'Race and Hispanic origin',
  'Home value ranges',
  'Rent as a share of income',
  'Vehicles',
  'Class of worker',
  'Occupation',
  'Commuting',
  'School enrollment',
]);
const SHARE_GROUP_PREFIXES = ['Owner costs as a share of income'];

function isShareGroup(group) {
  return SHARE_GROUPS.has(group) || SHARE_GROUP_PREFIXES.some((p) => group.startsWith(p));
}

// Series colors for the single-municipality charts: municipality, school district, county, state.
const SERIES = ['s1', 's2', 's3', 's4'];
const SEG_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

// Room to the right of a full-width bar for its value label.
function gutterFor(units) {
  if (units.includes('dollars')) return '5.5rem';
  if (units.includes('count')) return '5rem';
  if (units.includes('minutes')) return '4.5rem';
  return '3.75rem';
}

// ── formatting ──

function formatValue(n, unit) {
  if (n === null || n === undefined) return '—';
  const fixed = (digits) =>
    n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  switch (unit) {
    case 'count':
      return Math.round(n).toLocaleString('en-US');
    case 'percent':
    case 'rate':
      return `${fixed(1)}%`;
    case 'dollars':
      return `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
    case 'years':
      return fixed(1);
    case 'number':
      return fixed(2);
    case 'minutes':
      return `${fixed(1)} min`;
    default:
      return n.toLocaleString('en-US');
  }
}

function moeText(row, unit) {
  if (!row) return '';
  if (row.moe_note === 'controlled') return 'No margin of error (controlled)';
  if (row.moe === null || row.moe === undefined) return '';
  return `± ${formatValue(row.moe, unit)}`;
}

// ── data shaping ──

function useProfile(measures, data) {
  return useMemo(() => {
    const sorted = [...measures].sort((a, b) => a.measure_order - b.measure_order);
    const measureById = new Map(sorted.map((m) => [m.measure_id, m]));

    // section label -> [{ name, universe, measures }]
    const groupsBySection = new Map(SECTIONS.map((s) => [s.label, []]));
    sorted.forEach((m) => {
      const groups = groupsBySection.get(m.section);
      if (!groups) return;
      let group = groups.find((g) => g.name === m.group);
      if (!group) {
        group = { name: m.group, universe: m.universe, measures: [] };
        groups.push(group);
      }
      if (!group.universe && m.universe) group.universe = m.universe;
      group.measures.push(m);
    });

    const placeMap = new Map();
    const values = new Map();
    data.forEach((row) => {
      if (!row.geo_id) return;
      if (!placeMap.has(row.geo_id)) {
        placeMap.set(row.geo_id, {
          geoId: row.geo_id,
          name: row.place,
          type: row.place_type,
          order: row.place_order,
        });
      }
      values.set(`${row.geo_id}|${row.measure_id}`, row);
    });
    const places = [...placeMap.values()].sort((a, b) => a.order - b.order);
    const municipalities = places.filter((p) => p.type === MUNICIPALITY);
    const comparisons = places.filter((p) => p.type !== MUNICIPALITY);

    return { measureById, groupsBySection, places, municipalities, comparisons, values };
  }, [measures, data]);
}

// A municipality's geo_id starts with its state + county code (e.g., 42029...).
function countyFor(place, places) {
  const counties = places.filter((p) => p.type === COUNTY);
  return counties.find((c) => place.geoId.startsWith(c.geoId)) ?? counties[0] ?? null;
}

// ── URL ──

function readParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    return { place: params.get('place'), section: params.get('section') };
  } catch {
    return { place: null, section: null };
  }
}

function writeParams(place, section) {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('place', place);
    params.set('section', section);
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', url);
  } catch {
    // URL sync is a convenience; ignore failures.
  }
}

function findSection(param) {
  if (!param) return null;
  const p = param.toLowerCase();
  return SECTIONS.find((s) => s.id === p || s.label.toLowerCase() === p) ?? null;
}

// ── components ──

function Estimate({ row, unit }) {
  const moe = moeText(row, unit);
  return (
    <>
      <span className={styles.est}>{formatValue(row?.value ?? null, unit)}</span>
      {moe && <span className={styles.moe}>{moe}</span>}
    </>
  );
}

function SectionTabs({ value, onChange, panelId }) {
  const refs = useRef({});
  const ids = SECTIONS.map((s) => s.id);
  const onKeyDown = (e) => {
    const i = ids.indexOf(value);
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = ids[(i + 1) % ids.length];
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = ids[(i - 1 + ids.length) % ids.length];
    if (e.key === 'Home') next = ids[0];
    if (e.key === 'End') next = ids[ids.length - 1];
    if (next) {
      e.preventDefault();
      onChange(next);
      refs.current[next]?.focus();
    }
  };
  return (
    <div className={styles.tabs} role="tablist" aria-label="Topic">
      {SECTIONS.map((s) => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            ref={(el) => { refs.current[s.id] = el; }}
            type="button"
            role="tab"
            id={`${panelId}-tab-${s.id}`}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
            onClick={() => onChange(s.id)}
            onKeyDown={onKeyDown}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ── charts (visual only; each group's table carries the same numbers) ──

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

const MOE_LEGEND = { label: 'Line shows margin of error', swatch: styles.whiskerSwatch };

function hasWhisker(row) {
  return row.value !== null && row.moe !== null && row.moe !== undefined && row.moe_note !== 'controlled';
}

// Horizontal bars in blocks (an optional heading per block; `sep` draws a
// divider before it). Bars that share a unit share a scale; each bar can carry
// a margin-of-error whisker from value − moe (clamped at 0) to value + moe.
// Counts for a county or the state dwarf a municipality's, so count bars are
// scaled to the municipalities; longer bars are drawn full width with a break mark.
const MUNICIPAL_TONES = new Set(['muni', 's1']);

function HBars({ title, blocks, legend }) {
  const rows = blocks.flatMap((b) => b.rows);
  const maxByUnit = new Map();
  rows.forEach((r) => {
    if (r.value === null) return;
    if (r.unit === 'count' && !MUNICIPAL_TONES.has(r.tone)) return;
    const upper = r.value + (hasWhisker(r) ? r.moe : 0);
    maxByUnit.set(r.unit, Math.max(maxByUnit.get(r.unit) ?? 0, upper));
  });
  const isBroken = (r) => r.value !== null && r.value > (maxByUnit.get(r.unit) ?? Infinity);
  const scale = (n, unit) => {
    const max = maxByUnit.get(unit) ?? 0;
    return max > 0 ? Math.min(Math.max(n, 0) / max, 1) * 100 : 0;
  };
  const gutter = gutterFor([...new Set(rows.map((r) => r.unit))]);

  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>{title}</h4>
      {legend && <Legend items={legend} />}

      {/* Visual only; the table below carries the same numbers for assistive tech. */}
      <div className={styles.hChart} style={{ '--gutter': gutter }} aria-hidden="true">
        {blocks.map((block) => (
          <div key={block.key} className={block.sep ? styles.hBlockSep : styles.hBlock}>
            {block.heading && <div className={styles.hBlockHeading}>{block.heading}</div>}
            {block.rows.map((d) => {
              const broken = isBroken(d);
              const whisker = hasWhisker(d) && !broken;
              const lo = whisker ? scale(d.value - d.moe, d.unit) : 0;
              const hi = whisker ? scale(d.value + d.moe, d.unit) : 0;
              const end = d.value !== null ? Math.max(scale(d.value, d.unit), hi) : 0;
              return (
                <div key={d.key} className={styles.hRow}>
                  <div className={styles.hLabel}>
                    <span>{d.name}</span>
                  </div>
                  <div className={styles.hPlot}>
                    <div className={styles.hPlotArea}>
                      {d.value !== null && (
                        <div
                          className={`${styles.hBar} ${styles[`tone_${d.tone}`]} ${broken ? styles.hBarBroken : ''}`}
                          style={{ width: `${scale(d.value, d.unit)}%` }}
                        />
                      )}
                      {whisker && (
                        <span className={styles.whisker} style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
                      )}
                      <span className={styles.hValue} style={{ left: `${end}%` }}>
                        {formatValue(d.value, d.unit)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function barRow(place, measure, profile, tone) {
  const row = profile.values.get(`${place.geoId}|${measure.measure_id}`);
  return {
    key: `${place.geoId}|${measure.measure_id}`,
    name: place.name,
    value: row?.value ?? null,
    moe: row?.moe ?? null,
    moe_note: row?.moe_note ?? '',
    unit: measure.unit,
    tone,
  };
}

// One 100% stacked bar per place across a group's percent measures, as published.
function ShareBars({ title, measures, places, profile }) {
  const percents = measures.filter((m) => m.unit === 'percent');
  if (percents.length === 0) return null;
  const segClass = (i) => styles[`seg_${SEG_COLORS[i % SEG_COLORS.length]}`];
  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>{title}</h4>
      <Legend
        items={percents.map((m, i) => ({
          label: m.label,
          swatch: `${styles.swatch} ${styles.segSwatch} ${segClass(i)}`,
        }))}
      />

      {/* Visual only; the table below carries the same numbers for assistive tech. */}
      <div className={styles.shareChart} aria-hidden="true">
        {places.map((p, pi) => (
          <div
            key={p.geoId}
            className={`${styles.shareRow} ${p.type !== MUNICIPALITY && places[pi - 1]?.type === MUNICIPALITY ? styles.shareRowSep : ''}`}
          >
            <div className={styles.shareLabel}>{p.name}</div>
            <div className={styles.shareBar}>
              {percents.map((m, i) => {
                const v = profile.values.get(`${p.geoId}|${m.measure_id}`)?.value ?? null;
                return v !== null && v > 0 ? (
                  <div key={m.measure_id} className={`${styles.shareSeg} ${segClass(i)}`} style={{ width: `${v}%` }}>
                    {v >= 12 && formatValue(v, m.unit)}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasureSelect({ measures, value, onChange }) {
  const id = useId();
  if (measures.length < 2) return null;
  return (
    <div className={styles.sortField}>
      <label className={styles.filterLabel} htmlFor={id}>Measure</label>
      <select id={id} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {measures.map((m) => (
          <option key={m.measure_id} value={m.measure_id}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}

function GroupHeading({ group, id }) {
  return (
    <div className={styles.groupHead}>
      <h3 className={styles.groupHeading} id={id}>{group.name}</h3>
      {group.universe && <p className={styles.universe}>{group.universe}</p>}
    </div>
  );
}

function HeadlineCards({ place, profile }) {
  return (
    <div className={styles.cards}>
      {HEADLINE_MEASURES.map((id) => {
        const m = profile.measureById.get(id);
        if (!m) return null;
        const row = profile.values.get(`${place.geoId}|${id}`);
        const moe = moeText(row, m.unit);
        return (
          <div key={id} className={styles.card}>
            <div className={styles.cardLabel}>{m.label}</div>
            <div className={styles.cardValue}>{formatValue(row?.value ?? null, m.unit)}</div>
            {moe && <div className={styles.moe}>{moe}</div>}
          </div>
        );
      })}
    </div>
  );
}

function PlaceGroupTable({ group, columns, place, profile }) {
  const headingId = useId();
  const bars = isBarGroup(group.name);
  const [chartMeasureId, setChartMeasureId] = useState(group.measures[0]?.measure_id ?? '');
  const oneAtATime = group.measures.length > MAX_GROUPED_MEASURES;
  const chartMeasure =
    group.measures.find((m) => m.measure_id === chartMeasureId) ?? group.measures[0];
  const legend = [
    ...columns.map((c, i) => ({ label: c.name, swatch: `${styles.swatch} ${styles[`tone_${SERIES[i]}`]}` })),
    MOE_LEGEND,
  ];
  const blocks = oneAtATime
    ? [{ key: 'one', rows: columns.map((c, i) => barRow(c, chartMeasure, profile, SERIES[i])) }]
    : group.measures.map((m) => ({
        key: m.measure_id,
        heading: m.label,
        rows: columns.map((c, i) => barRow(c, m, profile, SERIES[i])),
      }));

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <GroupHeading group={group} id={headingId} />
      {oneAtATime && (
        <div className={styles.sortControls}>
          <MeasureSelect measures={group.measures} value={chartMeasure.measure_id} onChange={setChartMeasureId} />
        </div>
      )}
      <HBars title={oneAtATime ? chartMeasure.label : group.name} blocks={blocks} legend={legend} />
      {isShareGroup(group.name) && (
        <ShareBars title={`${group.name}: shares by place`} measures={group.measures} places={columns} profile={profile} />
      )}
      <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby={headingId}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              {columns.map((c) => (
                <th scope="col" key={c.geoId} className={c.geoId === place.geoId ? styles.focusCol : ''}>
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.measures.map((m) => {
              const own = profile.values.get(`${place.geoId}|${m.measure_id}`);
              const showBar = bars && m.unit === 'percent' && own?.value !== null && own?.value !== undefined;
              const width = showBar ? Math.min(Math.max(own.value, 0), 100) : 0;
              return (
                <tr key={m.measure_id}>
                  <th scope="row">
                    {m.label}
                    {showBar && (
                      <span className={styles.track} aria-hidden="true">
                        <span className={styles.bar} style={{ width: `${width}%` }} />
                      </span>
                    )}
                  </th>
                  {columns.map((c) => (
                    <td key={c.geoId} className={c.geoId === place.geoId ? styles.focusCol : ''}>
                      <Estimate row={profile.values.get(`${c.geoId}|${m.measure_id}`)} unit={m.unit} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SingleView({ place, sectionLabel, profile }) {
  const columns = [
    place,
    profile.places.find((p) => p.type === SCHOOL_DISTRICT),
    countyFor(place, profile.places),
    profile.places.find((p) => p.type === STATE),
  ].filter(Boolean);
  const groups = profile.groupsBySection.get(sectionLabel) ?? [];
  return (
    <>
      {sectionLabel === 'People' && <HeadlineCards place={place} profile={profile} />}
      {groups.map((group) => (
        <PlaceGroupTable key={group.name} group={group} columns={columns} place={place} profile={profile} />
      ))}
    </>
  );
}

// Municipalities sorted by one measure (nulls last); default is place order.
function useSortedMunicipalities(municipalities, values, sortBy, order) {
  return useMemo(() => {
    if (!sortBy) return municipalities;
    const val = (p) => values.get(`${p.geoId}|${sortBy}`)?.value ?? null;
    return [...municipalities].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va === null && vb === null) return a.order - b.order;
      if (va === null) return 1;
      if (vb === null) return -1;
      return order === 'asc' ? va - vb : vb - va;
    });
  }, [municipalities, values, sortBy, order]);
}

function AllGroupTable({ group, profile }) {
  const headingId = useId();
  const sortId = useId();
  const orderId = useId();
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('desc');
  const munis = useSortedMunicipalities(profile.municipalities, profile.values, sortBy, order);
  const comps = profile.comparisons;
  const measuresAsRows = group.measures.length > MAX_MEASURE_COLUMNS;
  const cell = (place, m) => (
    <Estimate row={profile.values.get(`${place.geoId}|${m.measure_id}`)} unit={m.unit} />
  );

  // Chart: the chosen measure, municipalities highest to lowest, then comparison places.
  const [chartMeasureId, setChartMeasureId] = useState(group.measures[0]?.measure_id ?? '');
  const chartMeasure =
    group.measures.find((m) => m.measure_id === chartMeasureId) ?? group.measures[0];
  const chartMunis = useSortedMunicipalities(
    profile.municipalities,
    profile.values,
    chartMeasure?.measure_id ?? '',
    'desc'
  );
  const blocks = chartMeasure
    ? [
        { key: 'munis', rows: chartMunis.map((p) => barRow(p, chartMeasure, profile, 'muni')) },
        { key: 'comps', sep: true, rows: comps.map((p) => barRow(p, chartMeasure, profile, 'comp')) },
      ]
    : [];

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <GroupHeading group={group} id={headingId} />

      {chartMeasure && (
        <>
          <div className={styles.sortControls}>
            <MeasureSelect measures={group.measures} value={chartMeasure.measure_id} onChange={setChartMeasureId} />
          </div>
          <HBars
            title={chartMeasure.label}
            blocks={blocks}
            legend={[
              { label: 'Municipalities', swatch: `${styles.swatch} ${styles.tone_muni}` },
              { label: 'School district, counties and state', swatch: `${styles.swatch} ${styles.tone_comp}` },
              MOE_LEGEND,
            ]}
          />
          {isShareGroup(group.name) && (
            <ShareBars
              title={`${group.name}: shares by place`}
              measures={group.measures}
              places={[...chartMunis, ...comps]}
              profile={profile}
            />
          )}
        </>
      )}

      <div className={styles.sortControls}>
        <div className={styles.sortField}>
          <label className={styles.filterLabel} htmlFor={sortId}>Sort municipalities by</label>
          <select id={sortId} className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Municipality (default order)</option>
            {group.measures.map((m) => (
              <option key={m.measure_id} value={m.measure_id}>{m.label}</option>
            ))}
          </select>
        </div>
        {sortBy && (
          <div className={styles.sortField}>
            <label className={styles.filterLabel} htmlFor={orderId}>Order</label>
            <select id={orderId} className={styles.select} value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">Highest first</option>
              <option value="asc">Lowest first</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby={headingId}>
        {measuresAsRows ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Measure</th>
                {munis.map((p) => (
                  <th scope="col" key={p.geoId}>{p.name}</th>
                ))}
                {comps.map((p, i) => (
                  <th scope="col" key={p.geoId} className={i === 0 ? styles.compStart : styles.compCol}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.measures.map((m) => (
                <tr key={m.measure_id}>
                  <th scope="row">{m.label}</th>
                  {munis.map((p) => (
                    <td key={p.geoId}>{cell(p, m)}</td>
                  ))}
                  {comps.map((p, i) => (
                    <td key={p.geoId} className={i === 0 ? styles.compStart : styles.compCol}>
                      {cell(p, m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Place</th>
                {group.measures.map((m) => (
                  <th scope="col" key={m.measure_id}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {munis.map((p) => (
                <tr key={p.geoId}>
                  <th scope="row">{p.name}</th>
                  {group.measures.map((m) => (
                    <td key={m.measure_id}>{cell(p, m)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tbody className={styles.compBody}>
              {comps.map((p) => (
                <tr key={p.geoId}>
                  <th scope="row">{p.name}</th>
                  {group.measures.map((m) => (
                    <td key={m.measure_id}>{cell(p, m)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function AllView({ sectionLabel, profile }) {
  const groups = profile.groupsBySection.get(sectionLabel) ?? [];
  return groups.map((group) => (
    <AllGroupTable key={`${sectionLabel}|${group.name}`} group={group} profile={profile} />
  ));
}

export default function CommunityClient({ dataNote, measures = [], data = [] }) {
  const profile = useProfile(measures, data);
  const [placeId, setPlaceId] = useState(ALL);
  const [sectionId, setSectionId] = useState(SECTIONS[0].id);
  const [ready, setReady] = useState(false);
  const panelId = useId();

  // Apply ?place= and ?section= once on load, then keep the URL in sync.
  useEffect(() => {
    const { place, section } = readParams();
    if (place === ALL) setPlaceId(ALL);
    else if (profile.municipalities.some((p) => p.geoId === place)) setPlaceId(place);
    const s = findSection(section);
    if (s) setSectionId(s.id);
    setReady(true);
  }, [profile.municipalities]);

  useEffect(() => {
    if (ready) writeParams(placeId, sectionId);
  }, [ready, placeId, sectionId]);

  const place = profile.municipalities.find((p) => p.geoId === placeId) ?? null;
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Government</div>
          <h1 className={styles.heading}>Community Profile</h1>
          <p className={styles.intro}>
            Census Bureau estimates for each municipality, shown next to the school district, the county
            and Pennsylvania.
          </p>
          {dataNote}
        </div>
      </header>

      <div className={styles.content}>
        {profile.municipalities.length === 0 ? (
          <p className={styles.emptyText}>Census data isn&apos;t available right now. Check back soon.</p>
        ) : (
          <>
            <div className={styles.field}>
              <label className={styles.filterLabel} htmlFor="community-place">Municipality</label>
              <select
                id="community-place"
                className={styles.select}
                value={place ? place.geoId : ALL}
                onChange={(e) => setPlaceId(e.target.value)}
              >
                <option value={ALL}>All municipalities</option>
                {profile.municipalities.map((p) => (
                  <option key={p.geoId} value={p.geoId}>{p.name}</option>
                ))}
              </select>
            </div>

            <SectionTabs value={section.id} onChange={setSectionId} panelId={panelId} />

            <div
              id={panelId}
              role="tabpanel"
              aria-labelledby={`${panelId}-tab-${section.id}`}
              className={styles.panel}
            >
              <h2 className={styles.viewHeading}>
                {place ? place.name : 'All municipalities'}
                <span className={styles.viewSub}>{section.label}</span>
              </h2>
              {place ? (
                <SingleView place={place} sectionLabel={section.label} profile={profile} />
              ) : (
                <AllView sectionLabel={section.label} profile={profile} />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
