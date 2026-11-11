export function slugifyName(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Anchor id for one meeting's section on a recap detail page, shared by the
// detail page and the recaps list so links land on the right meeting.
export function recapAnchorId(meetingType) {
  return slugifyName(meetingType || '') || 'meeting';
}
