import { ENTITY_MAP } from '../../lib/entities';
import styles from './EntityTag.module.css';

// Color-coded municipality tag, consistent with the Calendar page's
// entity tags (app/calendar/calendar.module.css).
export default function EntityTag({ id, name, className = '' }) {
  const entity = ENTITY_MAP[id];
  const label = name || entity?.name || id || 'Unknown';
  const colors = entity?.colors || { bg: '#EDE9E0', color: '#0A1931' };

  return (
    <span className={`${styles.tag} ${className}`} style={{ background: colors.bg, color: colors.color }}>
      {label}
    </span>
  );
}
