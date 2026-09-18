// Shared municipality/entity metadata used across the Government, Recaps,
// and Votes sections so filters and color-coded tags stay consistent.

export const MUNICIPALITY_OPTIONS = [
  { id: 'wcasd', label: 'WCASD', name: 'WCASD Board of Education' },
  { id: 'borough', label: 'West Chester Borough', name: 'Borough of West Chester' },
  { id: 'east-goshen', label: 'East Goshen', name: 'East Goshen Township' },
  { id: 'west-goshen', label: 'West Goshen', name: 'West Goshen Township' },
  { id: 'east-bradford', label: 'East Bradford', name: 'East Bradford Township' },
  { id: 'west-whiteland', label: 'West Whiteland', name: 'West Whiteland Township' },
  { id: 'westtown', label: 'Westtown', name: 'Westtown Township' },
  { id: 'thornbury-chester', label: 'Thornbury (Chester Co.)', name: 'Thornbury Township (Chester Co.)' },
  { id: 'thornbury-delaware', label: 'Thornbury (Delaware Co.)', name: 'Thornbury Township (Delaware Co.)' },
  { id: 'chester-county', label: 'Chester County', name: 'Chester County' },
  { id: 'delaware-county', label: 'Delaware County', name: 'Delaware County' },
];

// Same muted-pastel-bg / dark-text palette style as app/data/meetings.js,
// extended to cover the county entities and the Thornbury county split.
export const ENTITY_COLORS = {
  wcasd: { bg: '#E8EEF5', color: '#0A2A4A' },
  borough: { bg: '#FDF3DC', color: '#5C3D00' },
  'east-goshen': { bg: '#E5F0EB', color: '#1A4532' },
  'west-goshen': { bg: '#EBF0E5', color: '#243D1A' },
  'east-bradford': { bg: '#F5EBE8', color: '#5C2018' },
  'west-whiteland': { bg: '#EBE8F0', color: '#2A1A50' },
  westtown: { bg: '#E8F0EE', color: '#1A3C38' },
  'thornbury-chester': { bg: '#F0EBE8', color: '#4A1A10' },
  'thornbury-delaware': { bg: '#F0E8EC', color: '#4A1030' },
  'chester-county': { bg: '#EAF0F5', color: '#1A3A5C' },
  'delaware-county': { bg: '#F5F0E5', color: '#5C4A1A' },
};

export function isValidMunicipalityId(id) {
  return MUNICIPALITY_OPTIONS.some((option) => option.id === id);
}

// Resolves a free-form "entity" cell (a slug like "wcasd", or a full name
// like "WCASD Board of Education") to a known municipality id. Returns null
// when it doesn't match anything we recognize, so callers can degrade
// gracefully instead of mis-tagging a meeting.
export function resolveEntityId(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (isValidMunicipalityId(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  const match = MUNICIPALITY_OPTIONS.find(
    (option) => option.name.toLowerCase() === lower || option.label.toLowerCase() === lower
  );
  return match ? match.id : null;
}

export const ENTITY_MAP = Object.fromEntries(
  MUNICIPALITY_OPTIONS.map((option) => [
    option.id,
    { ...option, colors: ENTITY_COLORS[option.id] },
  ])
);
