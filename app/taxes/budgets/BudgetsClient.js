'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './budgets.module.css';

const ALL_FUNDS = '__all__';
const ALL_FUNDS_PARAM = 'all';
const REVENUE = 'Revenue';
const SPENDING = 'Spending';
const FLOWS = [REVENUE, SPENDING];

// ── formatting ──

// Whole dollars with commas; blank (null) -> "—".
function formatMoney(n, { plus = false } = {}) {
  if (n === null || n === undefined) return '—';
  const whole = Math.round(n);
  const sign = whole < 0 ? '-' : plus && whole > 0 ? '+' : '';
  return `${sign}$${Math.abs(whole).toLocaleString('en-US')}`;
}

function formatPct(n, { plus = false } = {}) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  const sign = n < 0 ? '-' : plus && n > 0 ? '+' : '';
  return `${sign}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

// Change from prior to current; null when either side is blank.
function change(current, prior) {
  if (current === null || current === undefined || prior === null || prior === undefined) {
    return { amount: null, pct: null };
  }
  const amount = current - prior;
  return { amount, pct: prior !== 0 ? (amount / Math.abs(prior)) * 100 : null };
}

function formatChange(current, prior) {
  const c = change(current, prior);
  if (c.amount === null) return '—';
  return c.pct === null
    ? formatMoney(c.amount, { plus: true })
    : `${formatMoney(c.amount, { plus: true })} (${formatPct(c.pct, { plus: true })})`;
}

// Sum of the non-blank values; null if every value is blank.
function sumNullable(values) {
  const present = values.filter((v) => v !== null && v !== undefined);
  return present.length ? present.reduce((a, b) => a + b, 0) : null;
}

function isZeroLine(line) {
  return !line.amount_current && !line.amount_prior;
}

// ── data shaping ──

function useGovernments(funds, lines) {
  return useMemo(() => {
    const byGov = new Map();
    funds.forEach((row) => {
      if (!row.gov_id) return;
      if (!byGov.has(row.gov_id)) {
        byGov.set(row.gov_id, {
          id: row.gov_id,
          name: row.government,
          order: row.gov_order,
          currentLabel: row.current_label,
          priorLabel: row.prior_label,
          note: row.gov_note,
          source: row.source,
          sourceUrl: row.source_url,
          funds: [],
        });
      }
      byGov.get(row.gov_id).funds.push(row);
    });
    const govs = [...byGov.values()].sort((a, b) => a.order - b.order);
    govs.forEach((g) => g.funds.sort((a, b) => a.fund_order - b.fund_order));

    const linesByKey = new Map();
    lines.forEach((line) => {
      const key = `${line.gov_id}|${line.fund}|${line.flow}`;
      if (!linesByKey.has(key)) linesByKey.set(key, []);
      linesByKey.get(key).push(line);
    });
    return { govs, linesByKey };
  }, [funds, lines]);
}

// Categories -> items -> details. Lines with a detail are grouped under their
// item; every other line is its own item. Category and item amounts are sums
// of their lines (null when every line is blank).
function buildCategories(lines) {
  const cats = new Map();
  lines.forEach((line) => {
    const name = line.category || 'Uncategorized';
    if (!cats.has(name)) cats.set(name, { name, lines: [], items: [], itemGroups: new Map() });
    const cat = cats.get(name);
    cat.lines.push(line);
    if (line.detail) {
      let group = cat.itemGroups.get(line.item);
      if (!group) {
        group = { key: `g:${line.item}`, name: line.item, details: [] };
        cat.itemGroups.set(line.item, group);
        cat.items.push(group);
      }
      group.details.push(line);
    } else {
      cat.items.push({ key: `l:${cat.items.length}`, name: line.item, line, details: [] });
    }
  });
  return [...cats.values()]
    .map((cat) => ({
      name: cat.name,
      lines: cat.lines,
      items: cat.items.map((item) => {
        const rows = item.line ? [item.line] : item.details;
        return {
          ...item,
          current: sumNullable(rows.map((r) => r.amount_current)),
          prior: sumNullable(rows.map((r) => r.amount_prior)),
        };
      }),
      current: sumNullable(cat.lines.map((l) => l.amount_current)),
      prior: sumNullable(cat.lines.map((l) => l.amount_prior)),
    }))
    .sort((a, b) => (b.current ?? -Infinity) - (a.current ?? -Infinity));
}

// Applies the $0 and search filters to one category's items. Returns null when
// nothing in the category is left to show.
function filterCategory(cat, query, showZero) {
  const q = query.trim().toLowerCase();
  const textMatch = (s) => !q || String(s ?? '').toLowerCase().includes(q);
  const keepLine = (line) => showZero || !isZeroLine(line);

  const items = [];
  cat.items.forEach((item) => {
    if (item.line) {
      if (!keepLine(item.line)) return;
      // A category-level line (no item name) matches on the category name.
      if (!textMatch(item.name || cat.name)) return;
      items.push(item);
      return;
    }
    const kept = item.details.filter(keepLine);
    if (kept.length === 0) return;
    const details = textMatch(item.name) ? kept : kept.filter((d) => textMatch(d.detail));
    if (details.length === 0) return;
    items.push({ ...item, details });
  });
  return items.length ? { ...cat, items } : null;
}

// ── URL ──

function readParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    return { gov: params.get('gov'), fund: params.get('fund') };
  } catch {
    return { gov: null, fund: null };
  }
}

function writeParams(gov, fund) {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('gov', gov);
    params.set('fund', fund === ALL_FUNDS ? ALL_FUNDS_PARAM : fund);
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', url);
  } catch {
    // URL sync is a convenience; ignore failures.
  }
}

// ── components ──

function SourceLink({ href, children }) {
  if (!href) return children;
  return (
    <a className={styles.sourceLink} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function ColumnHead({ flow, label }) {
  return (
    <>
      {flow}
      {label && <span className={styles.colLabel}>{label}</span>}
    </>
  );
}

function AllFundsTable({ gov, onSelectFund }) {
  const hasPrior = Boolean(gov.priorLabel);
  const totals = {
    revenue_current: sumNullable(gov.funds.map((f) => f.revenue_current)),
    spending_current: sumNullable(gov.funds.map((f) => f.spending_current)),
    revenue_prior: sumNullable(gov.funds.map((f) => f.revenue_prior)),
    spending_prior: sumNullable(gov.funds.map((f) => f.spending_prior)),
  };
  const footnoteId = useId();

  const cells = (row) => {
    const c = change(row.spending_current, row.spending_prior);
    return (
      <>
        <td>{formatMoney(row.revenue_current)}</td>
        <td>{formatMoney(row.spending_current)}</td>
        {hasPrior && (
          <>
            <td>{formatMoney(row.revenue_prior)}</td>
            <td>{formatMoney(row.spending_prior)}</td>
            <td>{formatMoney(c.amount, { plus: true })}</td>
            <td>{formatPct(c.pct, { plus: true })}</td>
          </>
        )}
      </>
    );
  };

  return (
    <div className={styles.allFunds}>
      <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={`${gov.name} funds`}>
        <table className={styles.table} aria-describedby={footnoteId}>
          <caption className={styles.visuallyHidden}>{gov.name}: all funds</caption>
          <thead>
            <tr>
              <th scope="col">Fund</th>
              <th scope="col"><ColumnHead flow="Revenue" label={gov.currentLabel} /></th>
              <th scope="col"><ColumnHead flow="Spending" label={gov.currentLabel} /></th>
              {hasPrior && (
                <>
                  <th scope="col"><ColumnHead flow="Revenue" label={gov.priorLabel} /></th>
                  <th scope="col"><ColumnHead flow="Spending" label={gov.priorLabel} /></th>
                  <th scope="col">Change in spending</th>
                  <th scope="col">Change in spending (%)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {gov.funds.map((f) => (
              <tr key={f.fund}>
                <th scope="row">
                  <button type="button" className={styles.fundLink} onClick={() => onSelectFund(f.fund)}>
                    {f.fund}
                  </button>
                </th>
                {cells(f)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Sum of all funds</th>
              {cells(totals)}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className={styles.footnote} id={footnoteId}>
        Money moved between funds (interfund transfers) is counted in both the fund that pays and the
        fund that receives it, so the sum of all funds is larger than the money the government actually
        takes in or spends.
      </p>
    </div>
  );
}

function SummaryCard({ title, current, prior, gov, emptyText }) {
  const hasPrior = Boolean(gov.priorLabel);
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        {title}
        <span className={styles.cardLabel}>{gov.currentLabel}</span>
      </div>
      {current === null && emptyText ? (
        <p className={styles.cardEmpty}>{emptyText}</p>
      ) : (
        <div className={styles.cardValue}>{formatMoney(current)}</div>
      )}
      {hasPrior && (
        <dl className={styles.cardMeta}>
          <div>
            <dt>{gov.priorLabel}</dt>
            <dd>{formatMoney(prior)}</dd>
          </div>
          <div>
            <dt>Change</dt>
            <dd>{formatChange(current, prior)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

function FlowTabs({ value, onChange, panelId }) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const i = FLOWS.indexOf(value);
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = FLOWS[(i + 1) % FLOWS.length];
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = FLOWS[(i - 1 + FLOWS.length) % FLOWS.length];
    if (e.key === 'Home') next = FLOWS[0];
    if (e.key === 'End') next = FLOWS[FLOWS.length - 1];
    if (next) {
      e.preventDefault();
      onChange(next);
      refs.current[next]?.focus();
    }
  };
  return (
    <div className={styles.tabs} role="tablist" aria-label="Revenue or spending">
      {FLOWS.map((flow) => {
        const active = flow === value;
        return (
          <button
            key={flow}
            ref={(el) => { refs.current[flow] = el; }}
            type="button"
            role="tab"
            id={`${panelId}-tab-${flow}`}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
            onClick={() => onChange(flow)}
            onKeyDown={onKeyDown}
          >
            {flow}
          </button>
        );
      })}
    </div>
  );
}

// Share of a parent total; null ("—") when either amount is blank or the parent is 0.
function shareOf(amount, parent) {
  if (amount === null || amount === undefined || !parent) return null;
  return (amount / parent) * 100;
}

function ItemsTable({ cat, gov }) {
  const hasPrior = Boolean(gov.priorLabel);
  const amountCells = (current, prior, parent) => (
    <>
      <td>{formatMoney(current)}</td>
      <td>{formatPct(shareOf(current, parent))}</td>
      {hasPrior && (
        <>
          <td>{formatMoney(prior)}</td>
          <td>{formatChange(current, prior)}</td>
        </>
      )}
    </>
  );
  return (
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={`${cat.name} line items`}>
      <table className={`${styles.table} ${styles.itemsTable}`}>
        <caption className={styles.visuallyHidden}>{cat.name}: line items</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">{gov.currentLabel}</th>
            <th scope="col">% of category</th>
            {hasPrior && (
              <>
                <th scope="col">{gov.priorLabel}</th>
                <th scope="col">Change</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {cat.items.map((item) =>
            item.line ? (
              <tr key={item.key}>
                <th scope="row">
                  {item.name || cat.name}
                  {item.line.note && <span className={styles.rowNote}>{item.line.note}</span>}
                </th>
                {amountCells(item.line.amount_current, item.line.amount_prior, cat.current)}
              </tr>
            ) : (
              [
                <tr key={item.key} className={styles.itemGroupRow}>
                  <th scope="row">{item.name}</th>
                  {amountCells(item.current, item.prior, cat.current)}
                </tr>,
                ...item.details.map((d, i) => (
                  <tr key={`${item.key}|${i}`} className={styles.detailRow}>
                    <th scope="row">
                      {d.detail}
                      {d.note && <span className={styles.rowNote}>{d.note}</span>}
                    </th>
                    {amountCells(d.amount_current, d.amount_prior, item.current)}
                  </tr>
                )),
              ]
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function CategoryRow({ cat, fullCat, gov, total, flow, open, onToggle }) {
  const regionId = useId();
  const share = total ? ((fullCat.current ?? 0) / total) * 100 : null;
  const width = share === null ? 0 : Math.min(Math.max(share, 0), 100);
  const hasPrior = Boolean(gov.priorLabel);
  // A category reported as a single line with no item name doesn't expand.
  const expandable = !(cat.items.length === 1 && cat.items[0].line && !cat.items[0].name);
  const note = !expandable ? cat.items[0].line.note : '';

  const content = (
    <>
      <span className={styles.catTop}>
        {expandable && (
          <span className={styles.chevron} aria-hidden="true">{open ? '−' : '+'}</span>
        )}
        <span className={styles.catName}>{cat.name}</span>
        <span className={styles.catShare}>
          {formatPct(share)} of fund {flow === REVENUE ? 'revenue' : 'spending'}
        </span>
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.bar} style={{ width: `${width}%` }} />
      </span>
      <span className={styles.figures}>
        <span className={styles.figure}>
          <span className={styles.figureLabel}>{gov.currentLabel}</span>
          <span className={styles.figureValue}>{formatMoney(fullCat.current)}</span>
        </span>
        {hasPrior && (
          <>
            <span className={styles.figure}>
              <span className={styles.figureLabel}>{gov.priorLabel}</span>
              <span className={styles.figureValue}>{formatMoney(fullCat.prior)}</span>
            </span>
            <span className={styles.figure}>
              <span className={styles.figureLabel}>Change</span>
              <span className={styles.figureValue}>{formatChange(fullCat.current, fullCat.prior)}</span>
            </span>
          </>
        )}
      </span>
    </>
  );

  return (
    <li className={styles.catItem}>
      {expandable ? (
        <button
          type="button"
          className={styles.catButton}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={onToggle}
        >
          {content}
        </button>
      ) : (
        <div className={styles.catStatic}>{content}</div>
      )}
      {note && <p className={styles.catNote}>{note}</p>}
      {expandable && (
        <div id={regionId} className={styles.catDetail} hidden={!open}>
          {open && <ItemsTable cat={cat} gov={gov} />}
        </div>
      )}
    </li>
  );
}

function Breakdown({ gov, fund, flow, lines }) {
  const [query, setQuery] = useState('');
  const [showZero, setShowZero] = useState(false);
  const [openCats, setOpenCats] = useState(() => new Set());
  const searchId = useId();
  const zeroId = useId();

  const categories = useMemo(() => buildCategories(lines), [lines]);
  const visible = useMemo(
    () =>
      categories
        .map((cat) => ({ full: cat, shown: filterCategory(cat, query, showZero) }))
        .filter((c) => c.shown),
    [categories, query, showZero]
  );
  const searching = query.trim() !== '';
  const matchCount = visible.reduce(
    (n, c) => n + c.shown.items.reduce((m, item) => m + (item.line ? 1 : item.details.length), 0),
    0
  );

  const fundTotal = flow === REVENUE ? fund.revenue_current : fund.spending_current;
  const total = fundTotal || sumNullable(categories.map((c) => c.current));
  const flowWord = flow === REVENUE ? 'revenue' : 'spending';

  const toggle = (name) =>
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  if (categories.length === 0) {
    return (
      <p className={styles.emptyText}>
        No {flowWord} lines are shown in the budget for this fund.
      </p>
    );
  }

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.searchField}>
          <label className={styles.filterLabel} htmlFor={searchId}>Search line items</label>
          <input
            id={searchId}
            type="search"
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <label className={styles.checkLabel} htmlFor={zeroId}>
          <input
            id={zeroId}
            type="checkbox"
            className={styles.checkbox}
            checked={showZero}
            onChange={(e) => setShowZero(e.target.checked)}
          />
          Show $0 lines
        </label>
      </div>

      <p className={styles.visuallyHidden} aria-live="polite">
        {searching ? `${matchCount} matching ${matchCount === 1 ? 'line' : 'lines'}` : ''}
      </p>

      {visible.length === 0 ? (
        <p className={styles.emptyText}>
          {searching ? 'No line items match your search.' : `No ${flowWord} lines to show.`}
        </p>
      ) : (
        <ul className={styles.catList}>
          {visible.map(({ full, shown }) => (
            <CategoryRow
              key={full.name}
              cat={shown}
              fullCat={full}
              gov={gov}
              total={total}
              flow={flow}
              open={searching || openCats.has(full.name)}
              onToggle={() => toggle(full.name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FundView({ gov, fund, linesByKey }) {
  const [flow, setFlow] = useState(SPENDING);
  const panelId = useId();
  const lines = linesByKey.get(`${gov.id}|${fund.fund}|${flow}`) ?? [];
  return (
    <div>
      <div className={styles.cards}>
        <SummaryCard
          title="Revenue"
          current={fund.revenue_current}
          prior={fund.revenue_prior}
          gov={gov}
          emptyText="Revenue not itemized in the budget summary."
        />
        <SummaryCard title="Spending" current={fund.spending_current} prior={fund.spending_prior} gov={gov} />
      </div>
      {fund.fund_note && <p className={styles.fundNote}>{fund.fund_note}</p>}

      <h2 className={styles.sectionHeading}>Breakdown</h2>
      <FlowTabs value={flow} onChange={setFlow} panelId={panelId} />
      <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-tab-${flow}`} className={styles.panel}>
        <Breakdown key={`${gov.id}|${fund.fund}|${flow}`} gov={gov} fund={fund} flow={flow} lines={lines} />
      </div>
    </div>
  );
}

export default function BudgetsClient({ dataNote, funds = [], lines = [] }) {
  const { govs, linesByKey } = useGovernments(funds, lines);
  const [govId, setGovId] = useState(govs[0]?.id ?? '');
  const [fundName, setFundName] = useState(ALL_FUNDS);
  const [ready, setReady] = useState(false);
  const viewHeadingRef = useRef(null);

  // Apply ?gov= and ?fund= once on load, then keep the URL in sync.
  useEffect(() => {
    const { gov: govParam, fund: fundParam } = readParams();
    const gov = govs.find((g) => g.id === govParam);
    if (gov) {
      setGovId(gov.id);
      if (fundParam === ALL_FUNDS_PARAM) setFundName(ALL_FUNDS);
      else if (gov.funds.some((f) => f.fund === fundParam)) setFundName(fundParam);
      else setFundName(ALL_FUNDS);
    } else if (fundParam === ALL_FUNDS_PARAM) {
      setFundName(ALL_FUNDS);
    } else if (govs[0]?.funds.some((f) => f.fund === fundParam)) {
      setFundName(fundParam);
    }
    setReady(true);
  }, [govs]);

  useEffect(() => {
    if (ready && govId) writeParams(govId, fundName);
  }, [ready, govId, fundName]);

  const gov = govs.find((g) => g.id === govId) ?? govs[0];
  const fund = gov?.funds.find((f) => f.fund === fundName) ?? null;

  // Clicking a fund name in the all-funds table replaces the table, so move
  // focus to the view heading rather than losing it.
  const onSelectFundFromTable = (name) => {
    setFundName(name);
    requestAnimationFrame(() => viewHeadingRef.current?.focus());
  };

  const onGovChange = (id) => {
    setGovId(id);
    setFundName(ALL_FUNDS);
  };

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Finances</div>
          <h1 className={styles.heading}>Budgets</h1>
          <p className={styles.intro}>
            Adopted budgets for the governments that tax West Chester-area residents, with every fund and
            line item as printed in each budget.
          </p>
          {dataNote}
        </div>
      </header>

      <div className={styles.content}>
        {!gov ? (
          <p className={styles.emptyText}>Budget data isn&apos;t available right now. Check back soon.</p>
        ) : (
          <>
            <div className={styles.selectors}>
              <div className={styles.field}>
                <label className={styles.filterLabel} htmlFor="budget-gov">Government</label>
                <select
                  id="budget-gov"
                  className={styles.select}
                  value={gov.id}
                  onChange={(e) => onGovChange(e.target.value)}
                >
                  {govs.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.filterLabel} htmlFor="budget-fund">Fund</label>
                <select
                  id="budget-fund"
                  className={styles.select}
                  value={fund ? fund.fund : ALL_FUNDS}
                  onChange={(e) => setFundName(e.target.value)}
                >
                  <option value={ALL_FUNDS}>All funds</option>
                  {gov.funds.map((f) => (
                    <option key={f.fund} value={f.fund}>{f.fund}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.govMeta}>
              {gov.note && <p>{gov.note}</p>}
              {gov.source && (
                <p>
                  Source: <SourceLink href={gov.sourceUrl}>{gov.source}</SourceLink>
                </p>
              )}
            </div>

            <section className={styles.section} aria-labelledby="budget-view-heading">
              <h2 className={styles.viewHeading} id="budget-view-heading" ref={viewHeadingRef} tabIndex={-1}>
                {gov.name}
                <span className={styles.viewSub}>{fund ? fund.fund : 'All funds'}</span>
              </h2>
              {fund ? (
                <FundView key={`${gov.id}|${fund.fund}`} gov={gov} fund={fund} linesByKey={linesByKey} />
              ) : (
                <AllFundsTable gov={gov} onSelectFund={onSelectFundFromTable} />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
