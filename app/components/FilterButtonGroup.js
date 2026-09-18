'use client';

import styles from './FilterButtonGroup.module.css';

// Generic multi-select pill filter: "All" plus a toggleable button per
// option. An empty `selected` array means "All" is active.
export default function FilterButtonGroup({ label, options, selected, onChange, allLabel = 'All' }) {
  const isAllActive = selected.length === 0;

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterHeader}>
        <div className={styles.filterLabel}>{label}</div>
        {!isAllActive && (
          <button type="button" className={styles.clearFilters} onClick={() => onChange([])}>
            Clear filters
          </button>
        )}
      </div>
      <div className={styles.filterGroup} role="group" aria-label={label}>
        <button
          type="button"
          className={`${styles.filterBtn} ${isAllActive ? styles.filterBtnActive : ''}`}
          aria-pressed={isAllActive}
          onClick={() => onChange([])}
        >
          {allLabel}
        </button>
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}
              aria-pressed={active}
              onClick={() => toggle(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
