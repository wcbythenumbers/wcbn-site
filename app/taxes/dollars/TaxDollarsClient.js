'use client';

import { useId, useMemo, useState } from 'react';
import MethodNote from '../../components/MethodNote';
import styles from './dollars.module.css';

// Display order for Step 3; the results summary uses County, Municipality, School district.
const SCHOOL = 'School district';
const COUNTY = 'County';
const MUNICIPALITY = 'Municipality';
const SUMMARY_ORDER = [COUNTY, MUNICIPALITY, SCHOOL];
const DETAIL_ORDER = [SCHOOL, COUNTY, MUNICIPALITY];
const BILL_LABELS = {
  [COUNTY]: 'County tax bill',
  [MUNICIPALITY]: 'Municipal tax bill',
  [SCHOOL]: 'School tax bill',
};

const PROPERTY = 'Property';
const EARNED_INCOME = 'Earned income';
const EIT_KEY = 'eit';

const MODE_ASSESSED = 'assessed';
const MODE_BILLS = 'bills';
const TOP_N = 8;

// "250,000", "$1,234.56" -> number; blank or invalid -> 0.
function parseInput(value) {
  const n = Number(String(value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Cents under $10, otherwise whole dollars.
function formatYour(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs < 10 && Math.round(abs * 100) !== 0) {
    return `${sign}$${abs.toFixed(2)}`;
  }
  const whole = Math.round(abs);
  return `${whole === 0 ? '' : sign}$${whole.toLocaleString('en-US')}`;
}

function formatWhole(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`;
}

function formatPct(n) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

// Property rates in mills; earned income rates as a percent (e.g., 0.75%).
function formatRate(row) {
  if (row.tax_type === EARNED_INCOME) {
    return `${row.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}%`;
  }
  return `${row.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} mills`;
}

// "Chester County" / "chester" -> "chester"
function countyKey(name) {
  return String(name ?? '').toLowerCase().replace(/\s*county\s*$/, '').trim();
}

function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}

function uniqueInOrder(values) {
  return [...new Set(values.filter(Boolean))];
}

// Builds level1 > level2 > level3 nodes for one body, with your dollars on
// each node allocated by amount ÷ the body's total budgeted amount. Rows with
// a blank lower level count toward their parent and attach their note there.
function buildTree(rows, dollars) {
  const total = sum(rows.map((r) => r.amount));
  const makeNode = (name) => ({ name, amount: 0, dollars: 0, notes: [], children: new Map() });
  const root = makeNode('');

  rows.forEach((row) => {
    const share = total !== 0 ? row.amount / total : 0;
    const path = [row.level1, row.level2, row.level3].map((v) => String(v ?? '').trim());
    let node = root;
    for (let i = 0; i < path.length && path[i]; i += 1) {
      if (!node.children.has(path[i])) node.children.set(path[i], makeNode(path[i]));
      node = node.children.get(path[i]);
      node.amount += row.amount;
      node.dollars += dollars * share;
    }
    if (row.note && node !== root && !node.notes.includes(row.note)) node.notes.push(row.note);
  });

  const finish = (node) => ({
    ...node,
    share: total !== 0 ? (node.amount / total) * 100 : 0,
    children: [...node.children.values()].map(finish).sort((a, b) => b.dollars - a.dollars),
  });
  return finish(root).children;
}

function useTaxData(rates, budget, bodies, settings) {
  return useMemo(() => {
    const municipalities = uniqueInOrder(rates.map((r) => r.municipality));
    const homestead = new Map(
      settings
        .filter((s) => s.setting === 'homestead_exclusion_assessed_value')
        .map((s) => [countyKey(s.county), s.value])
    );
    const budgetByBody = new Map();
    budget.forEach((row) => {
      if (!budgetByBody.has(row.body)) budgetByBody.set(row.body, []);
      budgetByBody.get(row.body).push(row);
    });
    const bodyInfo = new Map(bodies.map((b) => [b.body, b]));
    return { municipalities, homestead, budgetByBody, bodyInfo };
  }, [rates, budget, bodies, settings]);
}

// Groups a municipality's rate rows (property and earned income) by taxing body type.
function governmentsFor(rates, municipality) {
  const rows = rates.filter((r) => r.municipality === municipality);
  const groups = new Map();
  rows.forEach((row) => {
    const type = row.taxing_body_type;
    if (!groups.has(type)) groups.set(type, { type, government: '', components: [] });
    const group = groups.get(type);
    if (!group.government) group.government = row.government;
    if (row.body) group.components.push(row);
  });
  return groups;
}

// One entry per budget body, summing the user's dollars from every tax that
// maps to it. Bodies with a property tax always appear (as before); bodies
// funded only by earned income tax appear when that tax is greater than zero.
function bodiesFor(components) {
  const bodies = new Map();
  components.forEach((c) => {
    if (c.tax_type !== PROPERTY && !(c.dollars > 0)) return;
    if (!bodies.has(c.body)) bodies.set(c.body, { ...c, dollars: 0 });
    bodies.get(c.body).dollars += c.dollars;
  });
  return [...bodies.values()];
}

function ModeToggle({ value, onChange }) {
  const id = useId();
  const options = [
    { value: MODE_ASSESSED, label: 'Enter my assessed value' },
    { value: MODE_BILLS, label: 'Enter my tax bills' },
  ];
  return (
    <div className={styles.field}>
      <div className={styles.filterLabel} id={id}>How do you want to calculate?</div>
      <div className={styles.filterGroup} role="group" aria-labelledby={id}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MoneyInput({ id, label, value, onChange, help, prefix = '$' }) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div className={styles.field}>
      <label className={styles.filterLabel} htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <span className={styles.inputPrefix} aria-hidden="true">{prefix}</span>
        <input
          id={id}
          className={styles.input}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={helpId}
        />
      </div>
      {help && <p className={styles.help} id={helpId}>{help}</p>}
    </div>
  );
}

function Notes({ notes, className }) {
  if (!notes || notes.length === 0) return null;
  return notes.map((note) => (
    <p key={note} className={className || styles.lineNote}>{note}</p>
  ));
}

// One expandable budget line. Level2 nodes with level3 children expand again.
function LineItem({ node }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  const hasChildren = node.children.length > 0;
  const label = (
    <>
      <span className={styles.lineName}>{node.name}</span>
      <span className={styles.lineValue}>{formatYour(node.dollars)}</span>
    </>
  );
  return (
    <li className={styles.lineItem}>
      {hasChildren ? (
        <button
          type="button"
          className={styles.lineButton}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.chevron} aria-hidden="true">{open ? '−' : '+'}</span>
          {label}
        </button>
      ) : (
        <div className={styles.lineStatic}>{label}</div>
      )}
      <Notes notes={node.notes} />
      {hasChildren && (
        <ul id={regionId} className={styles.lineList} hidden={!open}>
          {node.children.map((child) => (
            <LineItem key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

// Level1 group: a horizontal bar that expands to its level2 items.
function GroupRow({ node, max }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  const hasChildren = node.children.length > 0;
  const width = max > 0 ? (Math.max(node.dollars, 0) / max) * 100 : 0;
  const content = (
    <>
      <span className={styles.groupTop}>
        {hasChildren && (
          <span className={styles.chevron} aria-hidden="true">{open ? '−' : '+'}</span>
        )}
        <span className={styles.groupName}>{node.name}</span>
        <span className={styles.groupValue}>
          {formatYour(node.dollars)}
          <span className={styles.groupPct}> · {formatPct(node.share)}</span>
        </span>
      </span>
      <span className={styles.groupTrack} aria-hidden="true">
        <span className={styles.groupBar} style={{ width: `${width}%` }} />
      </span>
    </>
  );
  return (
    <li className={styles.groupItem}>
      {hasChildren ? (
        <button
          type="button"
          className={styles.groupButton}
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
        >
          {content}
        </button>
      ) : (
        <div className={styles.groupStatic}>{content}</div>
      )}
      <Notes notes={node.notes} />
      {hasChildren && (
        <ul id={regionId} className={styles.lineList} hidden={!open}>
          {node.children.map((child) => (
            <LineItem key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function BodyBreakdown({ component, dollars, rows, info }) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const groups = useMemo(() => buildTree(rows, dollars), [rows, dollars]);
  const visible = showAll ? groups : groups.slice(0, TOP_N);
  const max = Math.max(...groups.map((g) => g.dollars), 0);

  return (
    <div className={styles.bodyCard}>
      <h4 className={styles.bodyHeading}>
        <span>{component.component || info?.fund || component.body}</span>
        <span className={styles.bodyAmount}>{formatYour(dollars)}</span>
      </h4>

      {groups.length === 0 ? (
        <p className={styles.emptyText}>Budget detail isn&apos;t available for this tax.</p>
      ) : (
        <>
          <ul className={styles.groupList} id={listId}>
            {visible.map((node) => (
              <GroupRow key={node.name} node={node} max={max} />
            ))}
          </ul>
          {groups.length > TOP_N && (
            <button
              type="button"
              className={styles.showAll}
              aria-expanded={showAll}
              aria-controls={listId}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show fewer' : `Show all (${groups.length})`}
            </button>
          )}
        </>
      )}

      {info && (
        <div className={styles.bodyMeta}>
          <p>
            {[info.fund, info.budget_year].filter(Boolean).join(' · ')}
          </p>
          {info.budget_total !== 0 && <p>Budgeted spending: {formatWhole(info.budget_total)}</p>}
          {info.detail_note && <p>{info.detail_note}</p>}
          {info.source && (
            <p>
              Source:{' '}
              {info.source_url ? (
                <a className={styles.sourceLink} href={info.source_url} target="_blank" rel="noopener noreferrer">
                  {info.source}
                </a>
              ) : (
                info.source
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TaxDollarsClient({
  dataNote,
  rates = [],
  budget = [],
  bodies = [],
  settings = [],
  budgetGovIds = {},
}) {
  const data = useTaxData(rates, budget, bodies, settings);
  const [municipality, setMunicipality] = useState('');
  const [mode, setMode] = useState(MODE_ASSESSED);
  const [assessed, setAssessed] = useState('');
  const [homesteadChecked, setHomesteadChecked] = useState(true);
  const [income, setIncome] = useState('');
  const [bills, setBills] = useState({ [COUNTY]: '', [MUNICIPALITY]: '', [SCHOOL]: '', [EIT_KEY]: '' });

  const governments = useMemo(
    () => (municipality ? governmentsFor(rates, municipality) : new Map()),
    [rates, municipality]
  );
  const hasMunicipalTax = (governments.get(MUNICIPALITY)?.components ?? []).some(
    (c) => c.tax_type === PROPERTY
  );

  // Dollars per rate row, plus property / earned income / total by government type.
  const result = useMemo(() => {
    const isProperty = (c) => c.tax_type === PROPERTY;
    const isIncome = (c) => c.tax_type === EARNED_INCOME;
    const incomeRows = [...governments.values()].flatMap((g) => g.components.filter(isIncome));
    const totalIncomeRate = sum(incomeRows.map((c) => c.rate));
    const eitPaid = parseInput(bills[EIT_KEY]);
    const incomeValue = parseInput(income);
    const value = parseInput(assessed);

    const byType = new Map();
    governments.forEach((group, type) => {
      const propertyRows = group.components.filter(isProperty);
      const totalMills = sum(propertyRows.map((c) => c.rate));
      const bill = type === MUNICIPALITY && !hasMunicipalTax ? 0 : parseInput(bills[type]);
      const components = group.components.map((c) => {
        let dollars = 0;
        if (isProperty(c)) {
          if (mode === MODE_ASSESSED) {
            dollars = (value * c.rate) / 1000;
            if (type === SCHOOL && homesteadChecked) {
              const exclusion = data.homestead.get(countyKey(c.county)) ?? 0;
              dollars = Math.max(dollars - (exclusion * c.rate) / 1000, 0);
            }
          } else {
            dollars = totalMills > 0 ? (bill * c.rate) / totalMills : 0;
          }
        } else if (isIncome(c)) {
          dollars =
            mode === MODE_ASSESSED
              ? (incomeValue * c.rate) / 100
              : totalIncomeRate > 0
                ? (eitPaid * c.rate) / totalIncomeRate
                : 0;
        }
        return { ...c, dollars };
      });
      const property = sum(components.filter(isProperty).map((c) => c.dollars));
      const earned = sum(components.filter(isIncome).map((c) => c.dollars));
      byType.set(type, {
        ...group,
        components,
        bodies: bodiesFor(components),
        property,
        earned,
        dollars: property + earned,
      });
    });
    const groups = [...byType.values()];
    const property = sum(groups.map((g) => g.property));
    const earned = sum(groups.map((g) => g.earned));
    return { byType, property, earned, total: property + earned };
  }, [governments, mode, assessed, income, homesteadChecked, bills, hasMunicipalTax, data.homestead]);

  const ready = Boolean(municipality) && result.total > 0;

  const sources = useMemo(() => {
    const seen = new Set();
    return bodies.filter((b) => {
      if (!b.source) return false;
      const key = `${b.government}|${b.source}|${b.source_url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [bodies]);

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.label}>Taxes &amp; Finances</div>
          <h1 className={styles.heading}>Where Your Tax Dollars Go</h1>
          <p className={styles.intro}>
            See what you pay in property taxes to Chester or Delaware County, your municipality, and the
            West Chester Area School District, and how each government budgets that money.
          </p>
          {dataNote}
        </div>
      </header>

      <div className={styles.content}>
        {data.municipalities.length === 0 ? (
          <p className={styles.emptyText}>Tax data isn&apos;t available right now. Check back soon.</p>
        ) : (
          <>
            <section className={styles.section} aria-labelledby="step1-heading">
              <div className={styles.step}>Step 1</div>
              <h2 className={styles.sectionHeading} id="step1-heading">Your municipality</h2>
              <label className={styles.visuallyHidden} htmlFor="municipality">Municipality</label>
              <select
                id="municipality"
                className={styles.select}
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
              >
                <option value="" disabled>Select your municipality</option>
                {data.municipalities.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </section>

            <section className={styles.section} aria-labelledby="step2-heading">
              <div className={styles.step}>Step 2</div>
              <h2 className={styles.sectionHeading} id="step2-heading">Your taxes</h2>
              <ModeToggle value={mode} onChange={setMode} />

              {mode === MODE_ASSESSED ? (
                <div className={styles.inputs}>
                  <MoneyInput
                    id="assessed-value"
                    label="Assessed value"
                    value={assessed}
                    onChange={setAssessed}
                    help="Your assessed value is on your county property tax bill and in your county's property records. It is not your home's market value."
                  />
                  <div className={styles.field}>
                    <label className={styles.checkLabel} htmlFor="homestead">
                      <input
                        id="homestead"
                        type="checkbox"
                        className={styles.checkbox}
                        checked={homesteadChecked}
                        onChange={(e) => setHomesteadChecked(e.target.checked)}
                        aria-describedby="homestead-help"
                      />
                      My home has the homestead exclusion
                    </label>
                    <p className={styles.help} id="homestead-help">
                      Most owner-occupied homes approved for Pennsylvania&apos;s homestead exclusion pay less
                      school tax. Leave unchecked for rental, commercial, or unapproved properties.
                    </p>
                  </div>
                  <MoneyInput
                    id="earned-income"
                    label="Annual earned income (wages and net business profit)"
                    value={income}
                    onChange={setIncome}
                    help="Optional. Local earned income tax applies to wages and net profits, not to investment income, Social Security or pensions."
                  />
                </div>
              ) : (
                <div className={styles.inputs}>
                  {SUMMARY_ORDER.map((type) =>
                    type === MUNICIPALITY && municipality && !hasMunicipalTax ? (
                      <div key={type} className={styles.field}>
                        <div className={styles.filterLabel}>{BILL_LABELS[type]}</div>
                        <p className={styles.help}>This municipality does not levy a real estate tax</p>
                      </div>
                    ) : (
                      <MoneyInput
                        key={type}
                        id={`bill-${type.replace(/\s+/g, '-').toLowerCase()}`}
                        label={BILL_LABELS[type]}
                        value={bills[type]}
                        onChange={(v) => setBills((prev) => ({ ...prev, [type]: v }))}
                      />
                    )
                  )}
                  <MoneyInput
                    id="bill-eit"
                    label="Local earned income tax paid"
                    value={bills[EIT_KEY]}
                    onChange={(v) => setBills((prev) => ({ ...prev, [EIT_KEY]: v }))}
                    help="The total local earned income tax you paid for the year (usually withheld by your employer and collected by Keystone Collections Group)."
                  />
                </div>
              )}

              {ready && (
                <div className={styles.results} aria-live="polite">
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <caption className={styles.tableCaption}>Your taxes</caption>
                      <thead>
                        <tr>
                          <th scope="col">Government</th>
                          <th scope="col">Property tax</th>
                          <th scope="col">Earned income tax</th>
                          <th scope="col">Total</th>
                          <th scope="col">% of total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SUMMARY_ORDER.map((type) => {
                          const g = result.byType.get(type);
                          const dollars = g?.dollars ?? 0;
                          return (
                            <tr key={type}>
                              <th scope="row">
                                {type}
                                {g?.government && <span className={styles.rowSub}>{g.government}</span>}
                              </th>
                              <td>{formatYour(g?.property ?? 0)}</td>
                              <td>{type === COUNTY ? '—' : formatYour(g?.earned ?? 0)}</td>
                              <td>{formatYour(dollars)}</td>
                              <td>{formatPct((dollars / result.total) * 100)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th scope="row">Total</th>
                          <td>{formatYour(result.property)}</td>
                          <td>{formatYour(result.earned)}</td>
                          <td>{formatYour(result.total)}</td>
                          <td>{formatPct(100)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {mode === MODE_ASSESSED && (
                    <div className={styles.tableWrap}>
                      <table className={`${styles.table} ${styles.tableSmall}`}>
                        <caption className={styles.tableCaption}>By tax</caption>
                        <thead>
                          <tr>
                            <th scope="col">Tax</th>
                            <th scope="col">Rate</th>
                            <th scope="col">Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {SUMMARY_ORDER.flatMap((type) =>
                            (result.byType.get(type)?.components ?? [])
                              .filter((c) => c.tax_type === PROPERTY || result.earned > 0)
                              .map((c) => (
                              <tr key={`${type}|${c.tax_type}|${c.body}`}>
                                <th scope="row">
                                  {c.government}
                                  {c.component && <span className={styles.rowSub}>{c.component}</span>}
                                </th>
                                <td>{formatRate(c)}</td>
                                <td>{formatYour(c.dollars)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className={styles.notes}>
                    Amounts are the face amount of each tax, before any early-payment discount or late
                    penalty. County and municipal taxes are for calendar year 2026; school taxes are for
                    the 2026-27 school year.
                  </p>
                  <p className={styles.notes}>
                    Not included: the local services tax ($52 a year for most workers, paid to the
                    municipality where you work, not where you live); the realty transfer tax (paid when a
                    property is sold); fees such as sewer and trash; and state and federal taxes.
                  </p>
                </div>
              )}
            </section>

            {ready && (
              <MethodNote summary="How we calculated this">
                <ul>
                  <li>
                    <strong>Tax amounts.</strong> Property tax = assessed value × each government&apos;s
                    millage ÷ 1,000. If you check the homestead box, the school district&apos;s homestead
                    exclusion is subtracted. Earned income tax = the income you enter × each
                    government&apos;s resident rate. These are estimates; your actual bills are the
                    authoritative amounts.
                  </li>
                  <li>
                    <strong>Where it goes.</strong> Governments don&apos;t assign specific tax dollars to
                    specific services. Property and income taxes are pooled with state and federal aid,
                    fees, fines, interest and other revenue, then spent through the budget. We divide your
                    share of each tax across that government&apos;s budget in proportion to budgeted
                    spending (&quot;pro rata&quot;). This shows how your share lines up with the budget,
                    not a traced flow of your money.
                  </li>
                  <li>
                    <strong>What&apos;s included.</strong> Only funds paid for by these taxes: each
                    government&apos;s general fund, plus funds supported by a dedicated tax (Chester
                    County&apos;s library, parks and debt service millage; open space taxes in East
                    Bradford and Westtown). Operations paid mainly by their own fees, such as sewer,
                    parking and trash, are excluded.
                  </li>
                  <li>
                    <strong>Budgets, not actual spending.</strong> Figures are adopted budgets: 2026 for
                    counties and municipalities, and 2026-27 for the school district. Actual spending will
                    differ.
                  </li>
                  <li>
                    <strong>Not included.</strong> Local services tax (paid where you work), realty
                    transfer tax (paid at a sale), fees, and state and federal taxes.
                  </li>
                  <li>
                    Thornbury Township (Chester Co.) has not published a detailed 2026 budget, so its
                    breakdown uses 2024 spending reported to the state.
                  </li>
                  <li>We calculated these figures from each government&apos;s budget documents.</li>
                </ul>
              </MethodNote>
            )}

            {ready && (
              <section className={styles.section} aria-labelledby="step3-heading">
                <div className={styles.step}>Step 3</div>
                <h2 className={styles.sectionHeading} id="step3-heading">Where it goes</h2>

                {DETAIL_ORDER.map((type) => {
                  const g = result.byType.get(type);
                  if (!g || g.bodies.length === 0) return null;
                  const headingId = `gov-${type.replace(/\s+/g, '-').toLowerCase()}`;
                  return (
                    <section key={type} className={styles.govSection} aria-labelledby={headingId}>
                      <h3 className={styles.govHeading} id={headingId}>
                        <span>{g.government}</span>
                        <span className={styles.govAmount}>{formatYour(g.dollars)}</span>
                      </h3>
                      {g.bodies.map((c) => (
                        <BodyBreakdown
                          key={c.body}
                          component={c}
                          dollars={c.dollars}
                          rows={data.budgetByBody.get(c.body) ?? []}
                          info={data.bodyInfo.get(c.body)}
                        />
                      ))}
                      {budgetGovIds[g.government] && (
                        <p className={styles.fullBudget}>
                          <a
                            className={styles.sourceLink}
                            href={`/taxes/budgets?gov=${encodeURIComponent(budgetGovIds[g.government])}`}
                          >
                            See the full {g.government} budget →
                          </a>
                        </p>
                      )}
                    </section>
                  );
                })}
              </section>
            )}

            <section className={styles.sources} aria-labelledby="dollars-sources">
              <h2 className={styles.sourcesHeading} id="dollars-sources">Sources</h2>
              <ul className={styles.sourceList}>
                {sources.map((s) => (
                  <li key={`${s.government}|${s.source}|${s.source_url}`}>
                    {s.government} —{' '}
                    {s.source_url ? (
                      <a className={styles.sourceLink} href={s.source_url} target="_blank" rel="noopener noreferrer">
                        {s.source}
                      </a>
                    ) : (
                      s.source
                    )}
                  </li>
                ))}
              </ul>
              <p>
                Tax rates: each government&apos;s adopted budget and tax resolutions; homestead exclusion and
                median homestead assessed value: West Chester Area School District 2026-27 Final Budget
                (PDE-2028).
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
