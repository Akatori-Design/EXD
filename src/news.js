// News articles behind the Home feed cards: /news.html?a=<id>.
// Each one keeps the card's header image and button, with the story told in a little more depth.

export const ARTICLES = {
  independence: {
    date: 'Sep 23, 2023',
    title: 'Welcome to the New Wave of Independence',
    sub: 'Premium distribution and big-brand partnerships, without signing your music away.',
    img: '/assets/dashboard/news-sign.jpg',
    alt: 'Sign to yourself',
    lead: "As a new industry alternative for independent artists, EXD Premier provides premium music distribution services and facilitates unique partnerships between artists and the world's biggest brands.",
    body: [
      ['h2', 'Sign to yourself'],
      ['p', "For years, reaching a big audience meant handing over your masters in exchange for a label's reach. EXD flips that: you keep full ownership of your recordings and your royalties, and we bring the reach to you."],
      ['h2', 'What Premier adds'],
      ['ul', [
        'Distribution to 150+ streaming platforms and stores, from a single upload.',
        'Exclusive sync and brand opportunities, like getting your music on ESPN programming.',
        'Promotion tools: Verified Artist status, YouTube channel setup, lyric videos and playlist collections.',
        'Royalty splits that pay your collaborators automatically, straight from each release.',
        'Clear analytics on streams, downloads and revenue by platform and territory.',
      ]],
      ['h2', 'Where to start'],
      ['p', 'Upload a track, add your cover art and release details, and pick a date. Once your release is live, the Premier perks open up: submit to brand deals from Exclusives, and grow your audience from Promote Yourself.'],
    ],
    cta: {
      title: 'Ready to put your first release out?',
      text: 'It takes a few minutes to set up, and you keep 100% of your masters.',
      primary: ['Upload a Track to Get Started', '/release-flow.html'],
      secondary: ['Explore Premier perks', '/exclusives.html'],
    },
  },

  heard: {
    date: 'Sep 05, 2023',
    title: 'Get Your Music Heard',
    sub: 'From upload to every major streaming platform, in a few simple steps.',
    img: '/assets/dashboard/news-heard.jpg',
    alt: 'Get your music heard. You deserve to know who and where your biggest fans are.',
    lead: 'Make the most of your music. With EXD, you can distribute your music to major streaming platforms without giving up ownership of your masters.',
    body: [
      ['h2', 'Step 1: Upload your music'],
      ['p', "Drag & drop your tracks or select them from a folder. If you're using the website, you can also upload them from a Dropbox account. For the best streaming and download quality, we recommend 16-bit, 44.1kHz stereo WAV files."],
      ['h2', 'Step 2: Add the extras'],
      ['p', "Add album artwork, featured artist details, and select your release date. We'll add the rest for you."],
      ['ul', [
        'Cover art: 3000×3000 to 6000×6000 px, square, JPEG or PNG.',
        'Credits: featured artists, contributors and publishers for each track.',
        'Royalty splits: share earnings with collaborators by percentage.',
      ]],
      ['h2', 'Step 3: Review and submit'],
      ['p', 'Once everything looks good, hit submit. After your release goes live, it takes about 48 hours for streaming data to start showing up in Analytics.'],
      ['h2', 'Then, promote it'],
      ['p', 'Once your release is approved, you can promote your music even more through Masterlinks: one smart link that sends fans to your music on whichever platform they use.'],
    ],
    cta: {
      title: 'Your next release starts here',
      text: 'Upload a track now and have it on streaming platforms by your chosen date.',
      primary: ['Upload a Track', '/release-flow.html'],
      secondary: ['Promote Yourself', '/promote.html'],
    },
  },

  fans: {
    date: 'Aug 12, 2023',
    title: 'Get to Know Your Fans',
    sub: 'Where they are, what they love about you, and how to better connect with them.',
    img: '/assets/dashboard/news-fans.jpg',
    alt: 'Get to know your fans',
    lead: 'Connect your socials to learn who your fans are, what they like about you, and how to grow your audience, at every turn of your career.',
    body: [
      ['h2', 'Your data, in one place'],
      ['p', "Fueled by your data, we're here to give you the facts and turn your social numbers into real fans' love. Connect your accounts once, and EXD brings your streaming and social numbers together."],
      ['h2', "What you'll learn"],
      ['ul', [
        'Where your listeners are, down to the countries and cities streaming you most.',
        'Which tracks and platforms are growing, and which ones are slowing down.',
        'How your followers, listeners and monthly streams change after each release.',
      ]],
      ['h2', 'Turn insight into action'],
      ['p', 'Plan tour stops where your listeners are, time your next release for when your audience is most active, and focus your promotion on the platforms that are already working for you.'],
    ],
    cta: {
      title: 'See who your fans really are',
      text: 'Connect your account to start building your audience picture.',
      primary: ['Connect My Account', '/settings.html#artist'],
      secondary: ['Open Analytics', '/analytics.html'],
    },
  },
};
export const ORDER = ['independence', 'heard', 'fans'];

/* render the page (only on news.html) */
const $ = (s) => document.querySelector(s);
const body = $('#news-body');
if (body) {
  const id = new URLSearchParams(location.search).get('a');
  const key = ARTICLES[id] ? id : ORDER[0];
  const a = ARTICLES[key];

  document.title = `${a.title} — EXD`;
  $('#news-date').textContent = a.date;
  $('#news-title').textContent = a.title;
  $('#news-sub').textContent = a.sub;
  const hero = $('#news-hero');
  hero.src = a.img;
  hero.alt = a.alt;

  const el = (tag, text) => {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    return n;
  };
  body.append(Object.assign(el('p', a.lead), { className: 'article__lead' }));
  for (const [tag, content] of a.body) {
    if (tag === 'ul') {
      const ul = el('ul');
      content.forEach((li) => ul.append(el('li', li)));
      body.append(ul);
    } else body.append(el(tag, content));
  }

  $('#news-cta-title').textContent = a.cta.title;
  $('#news-cta-text').textContent = a.cta.text;
  Object.assign($('#news-cta'), { textContent: a.cta.primary[0], href: a.cta.primary[1] });
  Object.assign($('#news-cta-2'), { textContent: a.cta.secondary[0], href: a.cta.secondary[1] });

  $('#news-more').innerHTML = ORDER.filter((k) => k !== key)
    .map((k) => {
      const m = ARTICLES[k];
      return `<li><a class="newsmore__item" href="/news.html?a=${k}"><img src="${m.img}" alt="" /><span><small>${m.date}</small><b>${m.title}</b></span></a></li>`;
    })
    .join('');
}
