'use client';

import FilterButtonGroup from './FilterButtonGroup';
import { MUNICIPALITY_OPTIONS } from '../../lib/entities';

// The municipality filter used across the site (Government Directory,
// Recaps, Votes): multi-select, "All" selected by default.
export default function MunicipalityFilter({ selected, onChange, label = 'Filter by municipality' }) {
  return (
    <FilterButtonGroup
      label={label}
      options={MUNICIPALITY_OPTIONS}
      selected={selected}
      onChange={onChange}
    />
  );
}
