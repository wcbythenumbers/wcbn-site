import { ImageResponse } from 'next/og';

export const alt = 'West Chester by the Numbers — Local government, by the numbers.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#0A1931';
const GOLD = '#C9A84C';
const WHITE = '#F8F6F0';

// Loads one weight of a Google Font as TrueType, limited to the characters
// used in the image. Returns null if the font can't be fetched.
async function loadGoogleFont(family, weight, text) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const name1 = 'West Chester';
  const name2 = 'by the Numbers';
  const tagline = 'Local government, by the numbers.';

  const [display, body] = await Promise.all([
    loadGoogleFont('Playfair Display', 900, name1 + name2),
    loadGoogleFont('Source Serif 4', 400, tagline),
  ]);

  const fonts = [];
  if (display) fonts.push({ name: 'Playfair Display', data: display, weight: 900, style: 'normal' });
  if (body) fonts.push({ name: 'Source Serif 4', data: body, weight: 400, style: 'normal' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: NAVY,
          borderBottom: `12px solid ${GOLD}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Playfair Display',
            fontWeight: 900,
            fontSize: 104,
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: WHITE }}>{name1}</span>
          <span style={{ color: GOLD }}>{name2}</span>
        </div>
        <div style={{ width: 120, height: 4, background: GOLD, margin: '44px 0 36px' }} />
        <div
          style={{
            fontFamily: 'Source Serif 4',
            fontSize: 44,
            color: 'rgba(248, 246, 240, 0.8)',
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
