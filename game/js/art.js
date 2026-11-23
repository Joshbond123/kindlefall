// Procedural art: every suit mark, the lantern and the icons are drawn here as SVG,
// so the game ships no image files and every shape is ours.

const SUN = '#f0b544';
const MOON = '#9a8cf0';
const LEAF = '#63c07d';
const ASH = '#e2604f';
const GOLD = '#e6c079';

export function suitGlyph(suit, colour) {
  const c = colour || { sun: SUN, moon: MOON, leaf: LEAF, ash: ASH }[suit];
  if (suit === 'sun') {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const x1 = 12 + Math.cos(a) * 7.4;
      const y1 = 12 + Math.sin(a) * 7.4;
      const x2 = 12 + Math.cos(a) * 11;
      const y2 = 12 + Math.sin(a) * 11;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`;
    }).join('');
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5.1" fill="${c}"/><circle cx="12" cy="12" r="2.1" fill="#0d1420" opacity="0.35"/>${rays}</svg>`;
  }
  if (suit === 'moon') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.6 3.4a8.8 8.8 0 1 0 5 12.6A7.2 7.2 0 0 1 15.6 3.4Z" fill="${c}"/><circle cx="19.4" cy="6.2" r="1.25" fill="${c}" opacity="0.85"/><circle cx="21.2" cy="10.1" r="0.8" fill="${c}" opacity="0.7"/></svg>`;
  }
  if (suit === 'leaf') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 3.6C10.8 3.4 4.2 8 4.2 14.2c0 2.6 1 4.6 2.6 6 1.6-6.2 6.2-9.6 10.6-11-4 2.6-7.2 6.2-8.4 11.4 1 .4 2 .6 3.2.6 5.2 0 8.4-6 8.2-17.6Z" fill="${c}"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c1.4 3.4 1 5.4-.4 7.2-1.2 1.5-1.6 3-1.1 4.6.9-1.4 2-2.2 3.2-2.8 2.3-1.1 3.6 1.1 3.6 3.4 0 3.4-2.4 6-5.6 6-3.6 0-6.3-2.6-6.3-6.4 0-5.2 4.6-7.2 6.6-12Z" fill="${c}"/></svg>`;
}

export function cardArt(card) {
  const c = { sun: SUN, moon: MOON, leaf: LEAF, ash: ASH }[card.suit];
  const base = `<circle cx="42" cy="30" r="24" fill="${c}" opacity="0.10"/>`;
  if (card.suit === 'sun') {
    return `<svg viewBox="0 0 84 62" aria-hidden="true">${base}
      <circle cx="42" cy="30" r="12" fill="none" stroke="${c}" stroke-width="2.4" opacity="0.95"/>
      <circle cx="42" cy="30" r="5" fill="${c}"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const r1 = 16;
        const r2 = 24;
        return `<line x1="${(42 + Math.cos(a) * r1).toFixed(1)}" y1="${(30 + Math.sin(a) * r1).toFixed(1)}" x2="${(42 + Math.cos(a) * r2).toFixed(1)}" y2="${(30 + Math.sin(a) * r2).toFixed(1)}" stroke="${c}" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>`;
      }).join('')}
    </svg>`;
  }
  if (card.suit === 'moon') {
    return `<svg viewBox="0 0 84 62" aria-hidden="true">${base}
      <path d="M50 8a22 22 0 1 0 12 30A18 18 0 0 1 50 8Z" fill="none" stroke="${c}" stroke-width="2.4"/>
      <circle cx="30" cy="18" r="1.8" fill="${c}"/><circle cx="24" cy="34" r="1.2" fill="${c}" opacity="0.8"/>
      <circle cx="36" cy="46" r="1" fill="${c}" opacity="0.7"/>
    </svg>`;
  }
  if (card.suit === 'leaf') {
    return `<svg viewBox="0 0 84 62" aria-hidden="true">${base}
      <path d="M62 8C34 6 16 20 16 38c0 6 2.5 11 6.5 14 3-14 13-24 27-28-11 6-19 15-22 28 2.5 1 5.5 1.5 8 1.5C48 53.5 62 39 62 8Z" fill="none" stroke="${c}" stroke-width="2.2"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 84 62" aria-hidden="true">${base}
    <path d="M42 6c3.4 8 2.4 12.5-1 16.5-2.6 3-3.4 6-2.4 9.4 2-3 4.4-4.6 7-5.8 4.8-2.2 7.6 2.2 7.6 7 0 7-5 12.5-11.6 12.5-7.4 0-13-5.4-13-13.2C29 23.6 37.6 19.4 42 6Z" fill="none" stroke="${c}" stroke-width="2.2"/>
  </svg>`;
}

export function lantern(colour = GOLD, glow = '#ffd98a') {
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <radialGradient id="lanternCore" cx="50%" cy="46%" r="52%">
        <stop offset="0%" stop-color="${glow}" stop-opacity="0.95"/>
        <stop offset="55%" stop-color="${colour}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${colour}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="56" r="40" fill="url(#lanternCore)"/>
    <path d="M60 8v10" stroke="${colour}" stroke-width="2.2" stroke-linecap="round" opacity="0.9"/>
    <circle cx="60" cy="21" r="3.4" fill="none" stroke="${colour}" stroke-width="2"/>
    <path d="M42 30h36l-4 6H46Z" fill="none" stroke="${colour}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M45 36c-4 8-6 16-6 24 0 12 9 22 21 22s21-10 21-22c0-8-2-16-6-24Z" fill="none" stroke="${colour}" stroke-width="2.4" stroke-linejoin="round" opacity="0.95"/>
    <path d="M52 42v38M68 42v38" stroke="${colour}" stroke-width="1.1" opacity="0.35"/>
    <path d="M60 46c5 7 7 11 7 15a7 7 0 0 1-14 0c0-4 2-8 7-15Z" fill="${glow}" opacity="0.9"/>
    <path d="M42 92h36" stroke="${colour}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M50 96h20l-3 6H53Z" fill="none" stroke="${colour}" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`;
}

export function wardShield(colour = '#86c7ff') {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.6 20 5.4v6.2c0 4.6-3.2 8.4-8 9.8-4.8-1.4-8-5.2-8-9.8V5.4Z" fill="none" stroke="${colour}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 7.4v8.2" stroke="${colour}" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
  </svg>`;
}

export function deckIcon(colour = GOLD) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="7" y="3" width="11" height="15" rx="2" fill="none" stroke="${colour}" stroke-width="1.6" opacity="0.55"/>
    <rect x="4.5" y="6" width="11" height="15" rx="2" fill="#101a26" stroke="${colour}" stroke-width="1.6"/>
  </svg>`;
}

export function intentIcon(kind) {
  const c = kind === 'guard' ? '#86c7ff' : kind === 'channel' ? '#c9b6ff' : '#ff9d8a';
  if (kind === 'guard') return wardShield(c);
  if (kind === 'channel') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 1 0 8.4 9.8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M12 8a4 4 0 1 0 4 4" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity="0.7"/><circle cx="12" cy="12" r="1.6" fill="${c}"/></svg>`;
  }
  if (kind === 'heavy') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 2.6 21 10l-2.2 2.2-2-2-6.4 6.4 2 2L10.2 21 2.8 13.6l2.2-2.2 2 2L13.4 7l-2-2Z" fill="${c}"/></svg>`;
  }
  if (kind === 'drain') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4 5.4 6 8.6 6 11.4A6 6 0 0 1 6 14.4C6 11.6 8 8.4 12 3Z" fill="none" stroke="${c}" stroke-width="2"/><path d="M12 9.5c1.8 2.4 2.6 3.8 2.6 5a2.6 2.6 0 0 1-5.2 0c0-1.2.8-2.6 2.6-5Z" fill="${c}" opacity="0.75"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.6 14 10l-1.6-1.6 2.4-2.4 3.2 3.2 1.6-1.6 1.4 1.4-1.6 1.6-2.6 2.6 1.6 1.6-2.4 2.4-1.6-1.6-10.6 10.6Z" fill="${c}"/><path d="M3.4 20.6 8 16l-1.6-1.6-3 3Z" fill="${c}" opacity="0.6"/></svg>`;
}

export function keeperPortrait() {
  return `<svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="17" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity="0.5"/>
    <path d="M20 7c2.6 5.6 2 8.6-1 11-1.8 1.5-2.4 3.2-2 5 1.4-2 3-3 4.6-3.6 3.2-1.4 5 1.4 5 4.6 0 4.6-3.4 8-8 8-4.8 0-8.6-3.6-8.6-8.8C10 17 17 15 20 7Z" fill="${GOLD}" opacity="0.9"/>
  </svg>`;
}

export function wardenPortrait() {
  return `<svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="17" fill="none" stroke="${ASH}" stroke-width="1.2" opacity="0.45"/>
    <path d="M20 6c-6 0-10.4 5-10.4 11.4 0 5 2.6 9 7 11.4V31h6.8v-2.2c4.4-2.4 7-6.4 7-11.4C30.4 11 26 6 20 6Z" fill="none" stroke="${ASH}" stroke-width="1.8"/>
    <circle cx="16" cy="18" r="1.7" fill="${ASH}"/><circle cx="24" cy="18" r="1.7" fill="${ASH}"/>
    <path d="M16.6 25.4h6.8" stroke="${ASH}" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>
  </svg>`;
}

export function cardBack() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4 19 6v5.4c0 4-2.8 7.3-7 8.6-4.2-1.3-7-4.6-7-8.6V6Z" fill="none" stroke="${GOLD}" stroke-width="1.5"/><circle cx="12" cy="10.4" r="2.1" fill="${GOLD}" opacity="0.8"/></svg>`;
}
