// Album data for My Music and the album pages (copied from the Figma screens),
// plus the release a visitor submits through the Release Music flow (kept in localStorage).

export const ALBUMS = {
  'dont-waste': {
    streams: { wk: 0, mo: 0, all: 48440 },
    title: "Don't Waste A Minute",
    cover: '/assets/dashboard/covers/dont-waste-a-minute.svg',
    status: 'released',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'R&B'],
      ['Released', 'Aug 31, 2023'],
      ['Format', 'Album'],
    ],
    tracks: [
      ['City of Palm', '3:20'],
      ['Minute mark', '2:45'],
      ['Chronos', '4:11'],
      ['Now or Never', '3:40'],
      ["Second's Sway", '5:01'],
      ['Twist', '3:22'],
    ],
  },
  vivid: {
    streams: { wk: 0, mo: 0, all: 0 },
    title: 'Vivid Reflection',
    cover: '/assets/dashboard/covers/vivid-reflection.svg',
    status: 'pending',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'R&B'],
      ['Release Date', 'Nov 21, 2023'],
      ['Format', 'Album'],
    ],
    tracks: [
      ['Echoes of Yesterday', '3:20'],
      ['Ripples', '2:45'],
    ],
  },
  // More catalogue (original cover art in /assets/dashboard/covers)
  'neon-tides': {
    streams: { wk: 0, mo: 0, all: 38630 },
    title: 'Neon Tides',
    cover: '/assets/dashboard/covers/neon-tides.svg',
    status: 'released',
    date: 'May 17, 2024',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'Electronic'],
      ['Released', 'May 17, 2024'],
      ['Format', 'Album'],
    ],
    tracks: [
      ['Low Tide Signal', '4:02'],
      ['Neon Tides', '3:48'],
      ['Saltwater Static', '3:15'],
      ['Undertow', '4:27'],
      ['Harbour Lights', '3:39'],
      ['Moonwake', '5:12'],
      ['Shoreline (Dub)', '6:04'],
      ['Last Ferry Home', '3:56'],
    ],
  },
  afterhours: {
    streams: { wk: 0, mo: 0, all: 45050 },
    title: 'Afterhours',
    cover: '/assets/dashboard/covers/afterhours.svg',
    status: 'released',
    date: 'February 9, 2024',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'House'],
      ['Released', 'Feb 9, 2024'],
      ['Format', 'EP'],
    ],
    tracks: [
      ['Afterhours', '5:31'],
      ['Taxi Lights', '4:18'],
      ['Closing Time Disco', '6:02'],
      ['4AM Telephone', '4:45'],
      ['Sunrise Over Mapo', '5:20'],
    ],
  },
  'satellite-hearts': {
    streams: { wk: 0, mo: 0, all: 49660 },
    title: 'Satellite Hearts',
    cover: '/assets/dashboard/covers/satellite-hearts.svg',
    status: 'released',
    date: 'October 27, 2023',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'Synth-pop'],
      ['Released', 'Oct 27, 2023'],
      ['Format', 'Album'],
    ],
    tracks: [
      ['Liftoff', '1:42'],
      ['Satellite Hearts', '3:33'],
      ['Gravity Well', '4:05'],
      ['Orbit (feat. Joey Newman)', '3:51'],
      ['Signal Lost', '3:12'],
      ['Mission Control', '4:20'],
      ['Re-entry', '3:44'],
    ],
  },
  'glass-garden': {
    streams: { wk: 0, mo: 0, all: 34090 },
    title: 'Glass Garden',
    cover: '/assets/dashboard/covers/glass-garden.svg',
    status: 'released',
    date: 'June 2, 2023',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'R&B'],
      ['Released', 'Jun 2, 2023'],
      ['Format', 'EP'],
    ],
    tracks: [
      ['Greenhouse', '3:27'],
      ['Glass Garden', '3:58'],
      ['Petals on the Window', '3:14'],
      ['Overgrown', '4:09'],
    ],
  },
  'midnight-bloom': {
    streams: { wk: 0, mo: 0, all: 0 },
    title: 'Midnight Bloom',
    cover: '/assets/dashboard/covers/midnight-bloom.svg',
    status: 'pending',
    date: 'December 13, 2024',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'Alternative'],
      ['Release Date', 'Dec 13, 2024'],
      ['Format', 'Album'],
    ],
    tracks: [
      ['Night Garden', '3:36'],
      ['Midnight Bloom', '4:01'],
      ['Violet Hour', '3:22'],
      ['Nocturne for Two', '4:44'],
      ['Moth to Flame', '3:30'],
      ['First Light', '5:08'],
    ],
  },
  'low-light': {
    streams: { wk: 0, mo: 0, all: 26550 },
    title: 'Low Light',
    cover: '/assets/dashboard/covers/low-light.svg',
    status: 'released',
    date: 'March 3, 2023',
    meta: [
      ['Artist', 'Rion Hale'],
      ['Label', 'J.A.C'],
      ['Genre', 'Hip-hop'],
      ['Released', 'Mar 3, 2023'],
      ['Format', 'Single'],
    ],
    tracks: [
      ['Low Light', '3:09'],
      ['Low Light (Instrumental)', '3:09'],
    ],
  },
};

/** Albums shown on the My Music shelf after the two from the Figma screens, newest first. */
export const SHELF_EXTRA = ['midnight-bloom', 'neon-tides', 'afterhours', 'satellite-hearts', 'glass-garden', 'low-light'];

const KEY = 'exd-release';

/** The release submitted in this browser, shaped like an ALBUMS entry, or null. */
export function submittedRelease() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY));
    if (!r || !r.title) return null;
    return {
      title: r.title,
      cover: r.cover || '/assets/dashboard/submitted-art.jpg',
      status: 'pending',
      date: r.date,
      meta: [
        ['Artist', r.artist || 'Rion Hale'],
        ['Genre', r.genre || 'R&B'],
        ['Release Date', r.dateLabel || ''],
        ['Format', r.format || 'Album'],
      ],
      tracks: (r.tracks || []).map((t) => [t.title || t.file, t.duration || '']),
    };
  } catch {
    return null;
  }
}

export function saveRelease(release) {
  try {
    localStorage.setItem(KEY, JSON.stringify(release));
    return true;
  } catch {
    // cover data URL too big for storage: keep the rest
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...release, cover: null }));
      return true;
    } catch {
      return false;
    }
  }
}

export function albumById(id) {
  if (id === 'new') return submittedRelease();
  return ALBUMS[id] || null;
}
