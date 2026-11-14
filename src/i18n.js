// Site language (English / 한국어). The choice is kept in localStorage and applied before
// anything else runs, so animated headings are split from the translated text.
// Korean copy is written as natural marketing copy, not a word-for-word translation.
// Strings are matched exactly (whitespace-trimmed); brand and platform names stay in English.

export const LANGS = { en: 'English', ko: '한국어' };

let lang = 'en';
try {
  const saved = localStorage.getItem('exd-lang');
  if (saved && LANGS[saved]) lang = saved;
} catch {}
export const LANG = lang;

const KO = {
  // ── head
  'EXD — Empowering Artists & Labels': 'EXD — 아티스트와 레이블의 성장 파트너',
  'Release unlimited music globally and keep 100% of your royalties.': '전 세계에 무제한으로 음원을 발매하고, 로열티는 100% 그대로 가져가세요.',
  'About — EXD': '회사 소개 — EXD',
  'EXD is bringing musical innovation everywhere: who we are, how we started and what we value.': '음악의 혁신을 모든 곳으로. EXD가 누구인지, 어떻게 시작했고 무엇을 중요하게 생각하는지 소개합니다.',
  'For Artists — EXD': '아티스트 — EXD',
  'Fuel your music and shape your journey: own 100% of your rights and earnings with EXD.': '음악에 날개를 달고 나만의 길을 만드세요. EXD와 함께라면 권리와 수익은 100% 당신의 것입니다.',
  'For Producers — EXD': '프로듀서 — EXD',
  'Your beats, their inspiration: the simplest way to take your beats global with EXD.': '당신의 비트가 누군가의 영감이 됩니다. EXD로 가장 쉽게 세계 무대에 서세요.',
  'Log in — EXD': '로그인 — EXD',
  'Log in to your EXD account.': 'EXD 계정에 로그인하세요.',
  'Sign up — EXD': '회원가입 — EXD',
  'Create your EXD account.': 'EXD 계정을 만들어 보세요.',
  'Forgot password — EXD': '비밀번호 찾기 — EXD',
  'Reset your EXD password.': 'EXD 비밀번호를 재설정하세요.',

  // ── header, menu, footer, overlays
  Home: '홈',
  'For Artist': '아티스트',
  'For Producer': '프로듀서',
  About: '회사 소개',
  'Log In': '로그인',
  'Sign Up': '회원가입',
  'EXD home': 'EXD 홈',
  Primary: '주요 메뉴',
  Language: '언어',
  Menu: '메뉴',
  'Be part of our ever-growing community on Discord!': '빠르게 성장 중인 EXD 디스코드 커뮤니티에 함께하세요!',
  'About EXD': 'EXD 소개',
  'About Us': '회사 소개',
  'Terms & Condition': '이용약관',
  Blog: '블로그',
  Career: '채용',
  Product: '서비스',
  Business: '비즈니스',
  Community: '커뮤니티',
  'X (Formerly Twitter)': 'X (구 트위터)',
  'Account Services': '계정',
  'Create Account': '계정 만들기',
  Login: '로그인',
  Contact: '문의하기',
  Help: '고객센터',
  '©2024 EXD All Rights Reserved.': '©2024 EXD. All Rights Reserved.',
  'Next in the build': '준비 중인 페이지',
  "This page exists in the prototype and isn't built yet.": '이 페이지는 곧 공개될 예정이에요.',
  'Back to home': '홈으로 돌아가기',
  Explore: '살펴보기',

  // ── home
  Empowering: '아티스트와 레이블의',
  'Artists & Labels': '가능성을 키웁니다',
  'RELEASE UNLIMITED MUSIC GLOBALLY,': '전 세계 무제한 음원 발매,',
  'KEEP 100% ROYALTY FOR $19.99': '로열티 100% 그대로, 단돈 $19.99',
  '/year': '/년',
  'We provide the essential tools for distribution, promotion, and fan engagement.': '유통부터 프로모션, 팬 소통까지 꼭 필요한 도구를 모두 갖췄습니다.',
  'Step into the spotlight where your music belongs.': '이제 당신의 음악이 주인공이 될 차례입니다.',
  'Join EXD': 'EXD 시작하기',
  'Streamline your music distribution with one upload.': '한 번의 업로드로 끝나는 음원 유통.',
  'Reach over': '전 세계',
  'streaming services worldwide.': '개 스트리밍 서비스에 한 번에 진출하세요.',
  'Streaming services': '스트리밍 서비스',
  'Unlock Your Career with Our Services': 'EXD와 함께 커리어의 문을 여세요',
  'Tailored services that scale with who you are.': '당신의 성장 단계에 꼭 맞춘 서비스.',
  'For Artists': '아티스트',
  'Experience a platform where resources meet independence, and creative freedom reigns.': '독립 아티스트에게 필요한 모든 리소스를, 창작의 자유는 그대로.',
  'Learn More': '자세히 보기',
  'Learn more': '자세히 보기',
  'For Producers': '프로듀서',
  'Amplify your beats, team up with global artists, and retain mastery over your creations.': '비트의 가치를 키우고, 세계의 아티스트와 협업하면서 창작물의 주도권은 온전히 지키세요.',
  'For Labels & Enterprise': '레이블 & 기업',
  "Discover rising talent and forge global collaborations—all while keeping control of your label's vision.": '떠오르는 인재를 발굴하고 글로벌 협업을 만드세요. 레이블의 비전은 흔들림 없이.',
  'What is': 'EXD는',
  'EXD?': '무엇인가요?',
  'We provide the tools :': '유통부터 마케팅까지,',
  'from distribution to marketing': '필요한 모든 도구를 제공합니다',
  'EXD is a music distribution and artist services platform for independent musicians. Reach listeners worldwide while keeping 100% ownership and creative control, with the tools for distribution, promotion and fan engagement in one place.':
    'EXD는 독립 뮤지션을 위한 음원 유통 · 아티스트 서비스 플랫폼입니다. 유통, 프로모션, 팬 소통 도구를 한곳에서 쓰며 전 세계 리스너를 만나고, 소유권과 창작의 주도권은 100% 지키세요.',
  'Sell your music now': '지금 음악 판매 시작하기',
  'Instant Insights': '실시간 인사이트',
  'Get daily updates on performance and playlist sources from Apple Music, Spotify, Amazon Music, YouTube Music and other top DSPs, so you can make informed decisions in real time.':
    'Apple Music, Spotify, Amazon Music, YouTube Music 등 주요 플랫폼의 성과와 플레이리스트 유입을 매일 확인하고, 데이터로 바로 다음 수를 결정하세요.',
  'Transparent Royalty': '투명한 로열티',
  "Our transparent royalty reports show your music's impact and guide your next release. You're always in control.": '한눈에 보이는 로열티 리포트로 내 음악의 영향력을 확인하고 다음 발매를 계획하세요. 결정권은 언제나 당신에게 있습니다.',
  'Complete Promotion': '올인원 프로모션',
  'All-in-one promotion tools, from eye-catching design to branding and legal services. We turn you into an unforgettable brand.': '눈길을 사로잡는 디자인부터 브랜딩, 법률 서비스까지. 당신을 잊을 수 없는 브랜드로 만들어 드립니다.',
  '“Exclusive” Feature': '‘익스클루시브’ 기능',
  'Partner with brands and artists that fit your style for collaborations and unique marketing through our “Exclusives” feature.': '‘익스클루시브’ 기능으로 내 스타일에 맞는 브랜드, 아티스트와 협업하고 특별한 마케팅 기회를 잡으세요.',
  'Your Music,': '당신의 음악,',
  'Your Terms,': '당신의 방식,',
  'Our Superstar Team.': '그리고 최고의 팀.',
  'We are a community of prominent independent leaders coming together to champion Artists Rights, and Musical Freedom.': '아티스트의 권리와 음악의 자유를 위해 모인, 업계를 이끄는 독립 리더들의 커뮤니티입니다.',
  "Our suite of services make the process of sharing your music worldwide simple yet effective. Whether you're a record label, distributor or content owner, we want to put the power of creative independence into your hands.":
    '전 세계에 음악을 알리는 과정을 단순하면서도 확실하게 만들어 드립니다. 레이블, 유통사, 콘텐츠 권리자 누구든 창작의 독립성을 직접 손에 쥘 수 있도록요.',
  'Artists we work with': '함께하는 아티스트',
  'Previous artist': '이전 아티스트',
  'Next artist': '다음 아티스트',
  'Musical Freedom': '음악의 자유,',
  'Begins Here': '여기서 시작됩니다',
  "No more restrictive contracts, no more outside interference, just pure music creation and distribution in its rawest form. Here, you're not just an artist, but the architect of your own music journey. Your freedom, your music - that's our promise to you.":
    '얽매이는 계약도, 외부의 간섭도 없습니다. 오직 음악을 만들고 세상에 내놓는 일에만 집중하세요. 이곳에서 당신은 아티스트를 넘어, 자신의 음악 여정을 직접 설계하는 사람입니다. 당신의 자유, 당신의 음악. 그것이 EXD의 약속입니다.',
  'Join us': '함께하기',
  FAQs: '자주 묻는 질문',
  'What is EXD?': 'EXD는 어떤 서비스인가요?',
  "EXD is a music distribution and artist services platform that empowers independent musicians to expand their music's global reach while retaining 100% ownership and creative control. It gives you the tools for distribution, promotion, and fan engagement so you can own your masters and share your music with the world.":
    'EXD는 독립 뮤지션이 소유권과 창작의 주도권을 100% 지키면서 음악을 전 세계로 넓힐 수 있도록 돕는 음원 유통 · 아티스트 서비스 플랫폼입니다. 유통, 프로모션, 팬 소통 도구로 마스터 권리를 지키며 세상과 음악을 나누세요.',
  'What is Digital Music Distribution': '디지털 음원 유통이란 무엇인가요?',
  'Digital music distribution is how your releases get from your hard drive to streaming services and stores. A distributor delivers your tracks, artwork and metadata to platforms like Spotify, Apple Music and YouTube Music, then collects the royalties those plays generate and pays them back to you.':
    '디지털 음원 유통은 내 컴퓨터 속 음악을 스트리밍 서비스와 음원 스토어로 보내는 과정입니다. 유통사가 음원, 아트워크, 메타데이터를 Spotify, Apple Music, YouTube Music 같은 플랫폼에 전달하고, 재생으로 발생한 로열티를 모아 아티스트에게 정산해 드립니다.',
  'Hero slides': '메인 슬라이드',
  'Slide 1': '슬라이드 1',
  'Slide 2': '슬라이드 2',
  'Slide 3': '슬라이드 3',
  'Two producers working at a studio console': '스튜디오 콘솔에서 작업 중인 두 프로듀서',
  'Singer performing on stage': '무대에서 공연하는 가수',
  'Producer reviewing a dashboard on a laptop': '노트북으로 대시보드를 확인하는 프로듀서',
  'Video shoot in front of a graffiti wall': '그래피티 벽 앞에서 진행 중인 영상 촬영',
  'Artist browsing a record shop': '레코드 숍을 둘러보는 아티스트',

  // ── about
  'We Are bringing Musical': '음악의 혁신을',
  'innovation Everywhere': '모든 곳으로',
  'At EXD, our mission is to empower artists by providing them with the tools they need to succeed in the digital age. We believe in giving creators control over their music, helping them reach new heights and connect with their audience like never before.':
    'EXD의 미션은 디지털 시대에 성공하는 데 필요한 도구로 아티스트에게 힘을 실어 주는 것입니다. 우리는 창작자가 자신의 음악을 스스로 결정해야 한다고 믿습니다. 더 높은 곳으로, 그리고 이전과는 다른 방식으로 팬과 만날 수 있도록 돕겠습니다.',
  'A EXD family company': 'EXD 패밀리 컴퍼니',
  'Founded by a team of music enthusiasts and tech innovators, EXD is dedicated to transforming the music industry. We combine cutting-edge technology with a passion for music to deliver unparalleled services to artists worldwide.':
    '음악을 사랑하는 사람들과 기술 혁신가들이 모여 만든 EXD는 음악 산업의 변화를 이끌고 있습니다. 최첨단 기술과 음악에 대한 열정을 더해, 전 세계 아티스트에게 차원이 다른 서비스를 제공합니다.',
  'How we started': 'EXD의 시작',
  'Launched in 2022, EXD is a collective of leaders within entertainment, fashion, finance, and digital industries. We work in unison with one another to promote, help and protect the interests of our clients, and push the boundaries of culture.':
    '2022년 출범한 EXD는 엔터테인먼트, 패션, 금융, 디지털 업계의 리더들이 모인 팀입니다. 하나의 팀으로 움직이며 고객의 이익을 알리고, 돕고, 지키는 동시에 문화의 경계를 넓혀 갑니다.',
  'Locations across the globe': '전 세계 거점',
  'Team Members': '팀 멤버',
  'Our Core Values': 'EXD의 핵심 가치',
  'The Foundation.': '우리가 지키는 기준.',
  'Be Honest': '정직하게',
  'We are only as valuable as the word we give to others.': '우리의 가치는 우리가 지키는 약속만큼입니다.',
  Work: '일하는 방식',
  'Work Hard, Work Smart.': '치열하게, 그리고 영리하게.',
  'Always give back to those who support you.': '나를 지지해 준 사람들에게 늘 보답합니다.',
  Vision: '비전',
  'Make your vision a reality. Do not settle on the judgement of others.': '비전을 현실로 만드세요. 남의 판단에 안주하지 마세요.',
  'Be Passionate': '열정적으로',
  'Be Bold, Be Creative, Be Loud.': '대담하게, 창의적으로, 더 크게.',
  'Our Partners': '파트너',
  "We pair innovative technology with high-touch service by genuine industry experts, and is customized to each rights holder's unique needs. This hybrid approach allows for more thorough detections throughout UGC platforms, fewer false claims, and reliably higher returns to creators.":
    '혁신적인 기술에 현업 전문가의 세심한 서비스를 더해, 권리자마다 다른 필요에 맞춰 운영합니다. 이 하이브리드 방식 덕분에 UGC 플랫폼 전반에서 더 꼼꼼하게 탐지하고, 잘못된 클레임은 줄이며, 창작자에게 더 높은 수익을 꾸준히 돌려드립니다.',
  'A hooded figure standing in red smoke': '붉은 연기 속에 서 있는 후드 차림의 인물',

  // ── artist
  'Fuel Your Music,': '음악에 날개를 달고,',
  'Shape Your Journey': '나만의 길을 만드세요',
  'OWN 100% RIGHTS AND EARNINGS': '권리와 수익, 100% 당신의 것',
  'A platform built for independent artists.': '독립 아티스트를 위해 만든 플랫폼.',
  'Keep your rights, your earnings and your freedom.': '권리도, 수익도, 자유도 온전히 지키세요.',
  'Get started': '시작하기',
  'Launch Your Music Journey': '당신의 음악 여정,',
  in: '단',
  'Four Simple Steps': '4단계로 시작하세요',
  'Four simple steps': '간단한 4단계',
  'How it works': '이용 방법',
  'Sign Up and Setup': '가입 & 설정',
  'Sign up free and set up your artist profile in minutes.': '무료로 가입하고 몇 분 만에 아티스트 프로필을 완성하세요.',
  'Upload and Distribute': '업로드 & 유통',
  'Upload once. We deliver to 150+ streaming services and handle the formatting.': '한 번만 올리세요. 150곳 이상의 스트리밍 서비스 전송과 포맷 변환은 EXD가 맡습니다.',
  'Analyze and Earn': '분석 & 수익',
  'Track streams, downloads and earnings live, and see what to release next.': '스트리밍, 다운로드, 수익을 실시간으로 확인하고 다음 발매를 계획하세요.',
  'Promote and Pitch': '프로모션 & 피칭',
  'Pitch for playlists, grab promo kits and submit tracks for film and ad placements.': '플레이리스트에 피칭하고, 프로모션 키트를 받고, 영화 · 광고 삽입곡에도 도전하세요.',
  Streams: '스트리밍',
  'Jan 18': '1월 18일',
  'Feb 18': '2월 18일',
  'Mar 18': '3월 18일',
  'Apr 18': '4월 18일',
  'May 18': '5월 18일',
  'Jun 18': '6월 18일',
  'Streams of Asset and Products': '음원 · 앨범별 스트리밍',
  'Monthly Royalty': '월 로열티',
  'Escape Major Constraints': '메이저의 틀에서 벗어나',
  'Elevate Your Music with Us Now': '지금 EXD와 함께 비상하세요',
  'Sign up and release your first track today.': '오늘 가입하고 첫 트랙을 발매하세요.',
  'Which plan fits you the best?': '나에게 꼭 맞는 플랜은?',
  Plans: '플랜',
  Expert: '전문가와 함께하는',
  'Business Management': '비즈니스 매니지먼트',
  'Financial planning and career strategy that keep you on track.': '재무 계획부터 커리어 전략까지, 흔들리지 않도록 함께합니다.',
  'Expand Your Music': '한 단계 더 나아가는',
  Mastery: '음악 마스터리',
  'Unlock Your Creative Potential': '숨은 창작 잠재력을 깨우세요',
  'Guides on production and the business of music, for every stage of your career.': '프로덕션부터 음악 비즈니스까지, 커리어 단계별 가이드.',
  'Explore, Learn, Succeed': '탐색하고, 배우고, 성공하세요',
  'Articles and webinars from working artists, producers and marketers.': '현업 아티스트, 프로듀서, 마케터가 전하는 아티클과 웨비나.',
  'Join Our Community of Learners': '함께 배우는 커뮤니티에 참여하세요',
  'Learn alongside artists and producers who share what works.': '효과 있는 방법을 나누는 아티스트, 프로듀서와 함께 성장하세요.',
  'Visit Our Blog': '블로그 보러 가기',
  'New resources every week. Start reading.': '매주 새로운 콘텐츠가 올라옵니다. 지금 읽어 보세요.',
  'Why Choose Us?': '왜 EXD일까요?',
  'You own 100% rights & control': '권리와 결정권, 100% 당신의 것',
  'Keep full rights to your music and 100% of your royalties, for a minimal fee.': '합리적인 요금으로 음악의 모든 권리와 로열티 100%를 지키세요.',
  'Unlimited release to top platforms': '주요 플랫폼에 무제한 발매',
  'Instantly get your music on Spotify, Apple Music, Soundcloud, Pandora, and all the major platforms worldwide.': 'Spotify, Apple Music, SoundCloud, Pandora 등 전 세계 주요 플랫폼에 바로 음악을 선보이세요.',
  'Insights to know your audience': '팬을 이해하는 인사이트',
  'Understand your audience better with transparent data and intuitive insight reports.': '투명한 데이터와 직관적인 리포트로 내 리스너를 더 깊이 이해하세요.',
  'Professional promotion': '전문 프로모션',
  'Access an array of professional marketing tools and services that let you create and control your brand.': '다양한 전문 마케팅 도구와 서비스로 나만의 브랜드를 만들고 직접 이끌어 가세요.',
  'EXD exclusive features': 'EXD 익스클루시브',
  'Connect with reputable brands and artists for unique collaboration opportunities through our exclusive feature.': '익스클루시브 기능으로 신뢰받는 브랜드, 아티스트와 특별한 협업 기회를 만나세요.',
  'Artist profile and news cards in the dashboard': '대시보드의 아티스트 프로필과 소식 카드',
  'Album upload cards in the dashboard': '대시보드의 앨범 업로드 카드',
  'Streams chart for Apple Music and Spotify': 'Apple Music과 Spotify 스트리밍 차트',
  'Promotion cards for YouTube earnings and profile verification': 'YouTube 수익화와 프로필 인증 프로모션 카드',
  // plan cards (src/artist.js)
  'Turn your music into your career with us': '음악을 커리어로 바꾸는 첫걸음',
  'Escalate your music journey': '음악 여정을 한 단계 위로',
  'Expand your artistic horizons.': '아티스트로서의 지평을 넓히세요.',
  'Embrace the global rhythms.': '세계의 리듬을 품으세요.',
  'Stream on 35+ platforms including Facebook, Instagram, and TikTok': 'Facebook, Instagram, TikTok 등 35개 이상 플랫폼에 발매',
  'Access to Artist Verification': '아티스트 인증 지원',
  'All local DSPs': '모든 국내 음원 플랫폼',
  '2 tracks annually': '연 2곡 발매',
  'Basic education': '기초 교육 콘텐츠',
  'Keep 80% of royalties': '로열티 80% 정산',
  'Keep 100% of your royalties': '로열티 100% 정산',
  'Release on 150+ DSPs': '150개 이상 플랫폼에 발매',
  'Insights & analytics': '인사이트 & 분석',
  'Royalty statement': '로열티 정산서',
  'Pre-save link on major DSPs': '주요 플랫폼 프리세이브 링크',
  'Access to Promote tools': '프로모션 도구 이용',
  'Includes all EXD benefits': 'EXD 플랜 혜택 모두 포함',
  'Promotional tools': '프로모션 도구',
  'Eligibility to submit your work to EXD music partners': 'EXD 음악 파트너사에 작품 제출 가능',
  'Lyrics Video service': '리릭 비디오 서비스',
  'Exclusive publishing and Sync service': '독점 퍼블리싱 & 싱크 서비스',
  'ArtistPages website to build your brand': '브랜드를 위한 ArtistPages 웹사이트',
  'Eligible to be invited to PARTNER': 'PARTNER 프로그램 초대 대상',
  'Includes all Premier benefits': 'Premier 혜택 모두 포함',
  'Custom distribution strategy': '맞춤형 유통 전략',
  'Scheduled release dates': '발매일 예약',
  'Dedicated customer support': '전담 고객 지원',
  'Advanced streaming analytics': '고급 스트리밍 분석',
  'Playlist pitching': '플레이리스트 피칭',
  'Global business consulting': '글로벌 비즈니스 컨설팅',

  // ── producer
  'Your Beats,': '당신의 비트가',
  'Their Inspiration': '누군가의 영감이 됩니다',
  'THE SIMPLEST WAY TO TAKE YOUR': '당신의 비트를 세계로',
  'BEATS GLOBAL': '가장 쉽게 보내는 방법',
  'Step into a realm of boundless possibilities. Amplify your beats, team up': '무한한 가능성의 세계로 들어서세요. 비트의 가치를 키우고,',
  'with global artists, and retain mastery over your creations.': '전 세계 아티스트와 협업하면서 창작물의 주도권은 온전히 지키세요.',
  'Coming soon': '오픈 예정',
  'Kickstart Your Global Beat Rise': '당신의 비트, 이제 세계로',
  'Showcase Your Talent': '재능을 마음껏 펼치세요',
  'Expose your beats to a wide network of independent artists seeking their perfect sound. Let your creativity shine in our curated beat marketplace.': '완벽한 사운드를 찾는 수많은 독립 아티스트에게 비트를 선보이세요. 엄선된 비트 마켓에서 당신의 창의력이 빛납니다.',
  'Create & Collaborate': '함께 만들고, 협업하세요',
  'Connect with artists for unique collaborations. Be a part of the creative journey from beat to hit record.': '아티스트와 연결되어 특별한 협업을 시작하세요. 비트가 히트곡이 되는 모든 과정에 함께합니다.',
  'Monetize Your Craft': '실력을 수익으로',
  'Set your prices and earn from each sale. Keep 100% of your earnings and control over your intellectual property.': '가격은 직접 정하고, 판매할 때마다 수익을 올리세요. 수익과 지식재산권은 100% 당신의 것입니다.',
  'Global Reach': '글로벌 무대',
  'Gain international exposure and work with artists from around the world. Your beats have no boundaries.': '세계 무대에 이름을 알리고 각국의 아티스트와 작업하세요. 당신의 비트에는 국경이 없습니다.',
  'Promotion & Branding': '프로모션 & 브랜딩',
  'Elevate your producer brand with our professional marketing tools and services. Stand out in a crowded marketplace.': '전문 마케팅 도구와 서비스로 프로듀서 브랜드의 가치를 높이고, 치열한 시장에서 돋보이세요.',
  'Exclusive Access:': '익스클루시브 액세스',
  'Access special opportunities to work with renowned artists and major brands via our exclusive feature.': '익스클루시브 기능으로 유명 아티스트, 메이저 브랜드와 작업할 특별한 기회를 잡으세요.',
  'Why Producers': '프로듀서가',
  'Choose Us': 'EXD를 선택하는 이유',
  'Direct-to-artist marketplace': '아티스트와 직접 만나는 마켓',
  'Set your terms and sell your beats to a global audience of artists. You control the pricing, you keep the profits.': '조건은 직접 정하고 전 세계 아티스트에게 비트를 판매하세요. 가격 결정도, 수익도 모두 당신의 몫입니다.',
  'Unrivaled collaborations': '최고의 협업',
  'Create alongside artists who appreciate your sound. Together, make tracks that resonate.': '당신의 사운드를 알아보는 아티스트와 함께, 오래 울림이 남는 트랙을 만드세요.',
  'Full control, no compromise': '타협 없는 주도권',
  'Retain full ownership over your beats while amplifying your reach through our platform.': '비트의 소유권은 온전히 지키면서, EXD 플랫폼으로 활동 반경을 넓히세요.',
  'Worldwide exposure': '전 세계에 알리세요',
  'We connect you with artists from every corner of the globe. Expand your influence and create international hits.': '세계 곳곳의 아티스트와 연결해 드립니다. 영향력을 넓히고 글로벌 히트곡을 만드세요.',
  'Resource powerhouse': '든든한 리소스',
  "With marketing and branding tools at your disposal, you're equipped to stand out and attract the right attention.": '마케팅과 브랜딩 도구를 마음껏 활용해 돋보이고, 꼭 필요한 관심을 모으세요.',
  'Shape The Sound': '내일의 사운드를',
  'Of Tomorrow': '지금 만드세요',
  "Are you ready to take your beats global? Join our community of producers and let's make music that moves the world.": '비트를 세계로 보낼 준비가 되셨나요? 프로듀서 커뮤니티에 합류해 세상을 움직이는 음악을 함께 만들어요.',
  'Apply now to be a producer': '프로듀서 지원하기',
  'Producer Application': '프로듀서 지원',
  'Two producers at a DJ controller, seen from above': '위에서 내려다본 DJ 컨트롤러 앞의 두 프로듀서',
  'Producer and artist working in a studio': '스튜디오에서 작업하는 프로듀서와 아티스트',
  'Producer pointing at a studio monitor': '스튜디오 모니터를 가리키는 프로듀서',
  'City lights on Earth seen from orbit': '우주에서 본 지구의 도시 불빛',
  'Photo shoot on a city rooftop': '도심 옥상에서 진행 중인 화보 촬영',
  'Engineer at a large studio console': '대형 스튜디오 콘솔 앞의 엔지니어',

  // ── log in / sign up / forgot password
  'Welcome back': '다시 오신 걸 환영해요',
  'Please enter your contact details to connect.': '계정 정보를 입력하고 로그인하세요.',
  Email: '이메일',
  Password: '비밀번호',
  'Remember me': '로그인 상태 유지',
  'Forgot password': '비밀번호를 잊으셨나요?',
  "Don't have an account ?": '아직 계정이 없으신가요?',
  'Sign up here': '회원가입',
  'Show password': '비밀번호 보기',
  'Hide password': '비밀번호 숨기기',
  'Let’s create your EXD account': 'EXD 계정을 만들어 볼까요?',
  'At least 8 characters, with a number or symbol.': '8자 이상, 숫자나 기호를 포함해 주세요.',
  'Confirm password': '비밀번호 확인',
  'By creating an account you agree to the': '계정을 만들면 EXD',
  'terms of service': '이용약관',
  'and privacy policy.': '및 개인정보 처리방침에 동의하게 됩니다.',
  'Terms of Service': '이용약관',
  'Already have an account?': '이미 계정이 있으신가요?',
  'Elevate Your Journey': '나에게 맞는 플랜으로',
  'with these plans': '여정을 시작하세요',
  'Free to Join': '무료로 시작',
  '*You can upgrade anytime.': '*언제든 업그레이드할 수 있어요.',
  'Deliver to Social Media': '소셜 미디어 배포',
  'Limited DSP Release': '일부 음원 플랫폼 발매',
  'Take 90% of royalties': '로열티 90% 정산',
  'Join for Free': '무료로 가입하기',
  'Most Popular': '가장 인기',
  '12 Months $19.99': '12개월 $19.99',
  'Includes all benefits from Basic': 'Basic 혜택 모두 포함',
  'Brand Yourself': '셀프 브랜딩 도구',
  'Take 100% of royalties': '로열티 100% 정산',
  'Unlimited DSP releases': '모든 음원 플랫폼 무제한 발매',
  Join: '가입하기',
  '*You can cancel your trial any time.': '*체험 기간에는 언제든 해지할 수 있어요.',
  '12 Months $49.99': '12개월 $49.99',
  'Includes all benefits from Plus': 'Plus 혜택 모두 포함',
  'Youtube Monetization': 'YouTube 수익화',
  'Exclusive Brand/Sync Deals': '독점 브랜드 · 싱크 딜',
  Payment: '결제',
  'Pay With:': '결제 수단',
  Card: '카드',
  Paypal: 'PayPal',
  'Card Number': '카드 번호',
  'Expiration Date': '유효기간',
  'Save card details': '카드 정보 저장',
  'Submit Order': '결제하기',
  'Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.': '입력하신 개인정보는 주문 처리와 서비스 이용 지원, 그리고 개인정보 처리방침에 안내된 목적으로만 사용됩니다.',
  '← Back to plans': '← 플랜 다시 고르기',
  'Order Summary': '주문 요약',
  'EXD Annual Subscription': 'EXD 연간 구독',
  Subtotal: '소계',
  Total: '총액',
  'Including taxes': '세금 포함',
  'Accepted: Visa, Mastercard, American Express, Apple Pay, PayPal': '사용 가능: Visa, Mastercard, American Express, Apple Pay, PayPal',
  'MM/YY': 'MM/YY',
  'Tell Us About': '어떤 활동을',
  'Your Role': '하고 계신가요?',
  'Your Information': '내 정보',
  'Select Your Role': '활동 유형',
  Artist: '아티스트',
  Producer: '프로듀서',
  Label: '레이블',
  'First name': '이름',
  'Last name': '성',
  'Country of residence': '거주 국가',
  Select: '선택',
  'United States': '미국',
  Canada: '캐나다',
  'United Kingdom': '영국',
  'South Korea': '대한민국',
  Japan: '일본',
  Australia: '호주',
  Germany: '독일',
  France: '프랑스',
  Brazil: '브라질',
  Mexico: '멕시코',
  Nigeria: '나이지리아',
  India: '인도',
  'Preference of currency': '선호 통화',
  'United States Dollar (USD)': '미국 달러 (USD)',
  'Euro (EUR)': '유로 (EUR)',
  'British Pound (GBP)': '영국 파운드 (GBP)',
  'Korean Won (KRW)': '대한민국 원 (KRW)',
  'Japanese Yen (JPY)': '일본 엔 (JPY)',
  'Canadian Dollar (CAD)': '캐나다 달러 (CAD)',
  Continue: '계속하기',
  Forgot: '비밀번호를',
  'Password?': '잊으셨나요?',
  "Enter your EXD email address and we'll send you a link to reset your password.": 'EXD 계정 이메일을 입력하시면 비밀번호 재설정 링크를 보내 드릴게요.',
  Send: '링크 보내기',
  'If you still need help,': '도움이 더 필요하신가요?',
  'contact support': '고객지원 문의하기',
  'Check your email': '메일함을 확인해 주세요',
  'We just sent a password reset link to:': '아래 주소로 비밀번호 재설정 링크를 보냈어요:',
  "Click on the link in the email and you'll be brought back here to reset your password.": '메일 속 링크를 누르면 이곳으로 돌아와 새 비밀번호를 설정할 수 있어요.',
  Back: '돌아가기',
  "Didn't get it? Check your spam folder or": '메일이 오지 않았나요? 스팸함을 확인하거나',
  'try another email': '다른 이메일로 다시 시도해 보세요',

  // testimonials (src/home.js)
  'Artist & Singer': '아티스트 & 싱어',
  'Artist & Producer': '아티스트 & 프로듀서',
  Singer: '싱어',
  '"Using EXD is like having a whole studio in your pocket. It gives me the freedom to experiment with sounds anytime, anywhere, turning inspiration into reality in an instant. It\'s revolutionized the way I create, making the creative process more fluid and intuitive."':
    '“EXD는 주머니 속 스튜디오 같아요. 언제 어디서든 마음껏 사운드를 실험하고, 떠오른 영감을 바로 현실로 만들 수 있죠. 작업 방식 자체가 달라졌어요. 창작이 훨씬 자연스럽고 직관적이 됐거든요.”',
  '"With EXD, I\'ve got endless possibilities right at my fingertips. It\'s made collaboration and creativity so much more accessible, allowing me to fine-tune every beat and melody on the go. The best part is how it breaks down barriers, letting anyone with a passion for music dive straight into producing."':
    '“EXD와 함께라면 무한한 가능성이 손끝에 있어요. 협업도 창작도 훨씬 쉬워져서, 이동 중에도 비트와 멜로디 하나하나를 다듬을 수 있죠. 무엇보다 진입 장벽을 없애 줘서, 음악에 대한 열정만 있으면 누구나 바로 프로듀싱을 시작할 수 있어요.”',
  '"EXD is like having a portable studio that adapts to my creative flow. I can capture ideas in the moment, layer sounds, and shape tracks with precision, all from my phone. It\'s given me the power to bring my musical vision to life, no matter where I am."':
    '“EXD는 제 창작 흐름에 맞춰 움직이는 휴대용 스튜디오예요. 휴대폰 하나로 순간의 아이디어를 담고, 사운드를 쌓고, 트랙을 정교하게 다듬죠. 어디에 있든 제가 그리는 음악을 현실로 만들 수 있게 됐어요.”',
  '"EXD has unlocked a new level of spontaneity in my creative process. I can lay down ideas in real-time and refine them as they evolve, without being tied to a traditional studio setup. It\'s allowed me to push boundaries and work with total freedom."':
    '“EXD 덕분에 작업이 훨씬 즉흥적이고 자유로워졌어요. 전통적인 스튜디오 환경에 얽매이지 않고, 아이디어를 실시간으로 기록하고 발전시켜 나가요. 한계를 넘어 완전히 자유롭게 작업할 수 있게 됐죠.”',

  // ── messages set from scripts (login.js, signup.js)
  'Enter your email address.': '이메일 주소를 입력해 주세요.',
  'That email address looks incomplete.': '이메일 주소를 다시 확인해 주세요.',
  'Create a password.': '비밀번호를 만들어 주세요.',
  'Enter your password.': '비밀번호를 입력해 주세요.',
  'Use at least 8 characters.': '8자 이상 입력해 주세요.',
  'Add a number or symbol.': '숫자나 기호를 하나 이상 넣어 주세요.',
  'Re-enter your password.': '비밀번호를 한 번 더 입력해 주세요.',
  "Passwords don't match.": '비밀번호가 일치하지 않아요.',
  "You'll confirm the payment with PayPal after you submit.": '결제하기를 누르면 PayPal에서 결제를 마무리하게 돼요.',
  "You'll confirm the payment with Apple Pay after you submit.": '결제하기를 누르면 Apple Pay로 결제를 마무리하게 돼요.',
  'EXD Basic · Annual Subscription': 'EXD Basic · 연간 구독',
  'EXD Plus · Annual Subscription': 'EXD Plus · 연간 구독',
  'EXD Premier · Annual Subscription': 'EXD Premier · 연간 구독',
};

const DICTS = { ko: KO };

/** Translate one UI string (returns it unchanged in English or when no translation exists). */
export function t(s) {
  if (LANG === 'en' || s == null) return s;
  const d = DICTS[LANG];
  const key = String(s).replace(/\s+/g, ' ').trim();
  return d[key] ?? s;
}

const ATTRS = ['placeholder', 'aria-label', 'alt', 'title', 'data-cursor', 'data-page'];

/** Translate text nodes and UI attributes under a root element. */
export function translate(root = document.body) {
  if (LANG === 'en') return;
  const d = DICTS[LANG];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('script, style, svg, noscript') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const raw = n.nodeValue;
    const key = raw.replace(/\s+/g, ' ').trim();
    if (!key || !(key in d)) continue;
    const lead = /^\s/.test(raw) ? ' ' : '';
    const trail = /\s$/.test(raw) ? ' ' : '';
    n.nodeValue = lead + d[key] + trail;
  }
  root.querySelectorAll('*').forEach((el) => {
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v && v.trim() in d) el.setAttribute(a, d[v.trim()]);
    }
  });
}

if (LANG !== 'en') {
  document.documentElement.lang = LANG;
  document.documentElement.classList.add(`lang-${LANG}`);
  // Hangul font: the Latin display/body fonts have no Korean glyphs
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap';
  document.head.append(font);
  if (document.title.trim() in KO) document.title = KO[document.title.trim()];
  const meta = document.querySelector('meta[name="description"]');
  if (meta && meta.content in KO) meta.content = KO[meta.content];
  translate();
}

/** Switch language and reload so every page part (and its animations) starts in the new language. */
export function setLang(next) {
  if (!LANGS[next] || next === LANG) return;
  try {
    localStorage.setItem('exd-lang', next);
  } catch {}
  location.reload();
}
