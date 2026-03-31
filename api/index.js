const performances = [
  {
    id: 1, title: '레미제라블', category: 'musical', venue: '블루스퀘어 신한카드홀', location: '서울 용산구',
    startDate: '2026-04-10', endDate: '2026-07-31', time: '평일 19:30 / 주말 14:00, 19:00',
    price: { vip: 170000, r: 140000, s: 110000, a: 80000 }, rating: 4.9, reviewCount: 2847,
    thumbnail: 'https://picsum.photos/seed/les-mis/300/400', poster: 'https://picsum.photos/seed/les-mis/400/560',
    cast: ['홍광호', '민우혁', '김소현', '이지혜'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: '멜론티켓', url: 'https://ticket.melon.com' },
      { name: 'YES24', url: 'https://ticket.yes24.com' },
    ],
  },
  {
    id: 2, title: '오페라의 유령', category: 'musical', venue: '샤롯데씨어터', location: '서울 송파구',
    startDate: '2026-05-01', endDate: '2026-08-15', time: '평일 19:30 / 주말 14:00, 18:00',
    price: { vip: 180000, r: 150000, s: 120000, a: 90000 }, rating: 4.8, reviewCount: 3156,
    thumbnail: 'https://picsum.photos/seed/phantom/300/400', poster: 'https://picsum.photos/seed/phantom/400/560',
    cast: ['박은태', '손준호', '김선영'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: 'YES24', url: 'https://ticket.yes24.com' },
    ],
  },
  {
    id: 3, title: 'IU 콘서트 "The Winning"', category: 'concert', venue: '잠실종합운동장 주경기장', location: '서울 송파구',
    startDate: '2026-05-15', endDate: '2026-05-17', time: '18:00',
    price: { vip: 198000, r: 154000, s: 110000 }, rating: 4.95, reviewCount: 5621,
    thumbnail: 'https://picsum.photos/seed/iu-concert/300/400', poster: 'https://picsum.photos/seed/iu-concert/400/560',
    cast: ['IU'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: '멜론티켓', url: 'https://ticket.melon.com' },
    ],
  },
  {
    id: 4, title: 'BTS Yet To Come in Seoul', category: 'concert', venue: '고척스카이돔', location: '서울 구로구',
    startDate: '2026-06-20', endDate: '2026-06-22', time: '19:00',
    price: { vip: 220000, r: 176000, s: 132000 }, rating: 4.97, reviewCount: 12340,
    thumbnail: 'https://picsum.photos/seed/bts/300/400', poster: 'https://picsum.photos/seed/bts/400/560',
    cast: ['BTS'], status: 'upcoming',
    ticketSources: [
      { name: '위버스샵', url: 'https://weverse.io' },
      { name: '인터파크', url: 'https://tickets.interpark.com' },
    ],
  },
  {
    id: 5, title: '햄릿', category: 'theater', venue: '국립극장 해오름극장', location: '서울 중구',
    startDate: '2026-04-05', endDate: '2026-05-30', time: '평일 19:30 / 주말 15:00',
    price: { r: 60000, s: 40000, a: 20000 }, rating: 4.6, reviewCount: 891,
    thumbnail: 'https://picsum.photos/seed/hamlet/300/400', poster: 'https://picsum.photos/seed/hamlet/400/560',
    cast: ['유인촌', '김태훈', '서이숙'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: 'YES24', url: 'https://ticket.yes24.com' },
    ],
  },
  {
    id: 6, title: '서울시향 베토벤 교향곡 시리즈', category: 'classic', venue: '예술의전당 콘서트홀', location: '서울 서초구',
    startDate: '2026-04-18', endDate: '2026-04-18', time: '19:30',
    price: { r: 100000, s: 70000, a: 40000 }, rating: 4.7, reviewCount: 562,
    thumbnail: 'https://picsum.photos/seed/beethoven/300/400', poster: 'https://picsum.photos/seed/beethoven/400/560',
    cast: ['서울시립교향악단'], status: 'on_sale',
    ticketSources: [
      { name: 'SAC티켓', url: 'https://www.sacticket.co.kr' },
      { name: '인터파크', url: 'https://tickets.interpark.com' },
    ],
  },
  {
    id: 7, title: '캣츠', category: 'musical', venue: '세종문화회관 대극장', location: '서울 종로구',
    startDate: '2026-06-01', endDate: '2026-08-31', time: '평일 19:30 / 주말 14:00, 18:00',
    price: { vip: 160000, r: 130000, s: 100000, a: 70000 }, rating: 4.7, reviewCount: 1983,
    thumbnail: 'https://picsum.photos/seed/cats/300/400', poster: 'https://picsum.photos/seed/cats/400/560',
    cast: ['옥주현', '정선아', '마이클 리'], status: 'upcoming',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: '멜론티켓', url: 'https://ticket.melon.com' },
      { name: 'YES24', url: 'https://ticket.yes24.com' },
    ],
  },
  {
    id: 8, title: 'BLACKPINK World Tour', category: 'concert', venue: '인스파이어 아레나', location: '인천 중구',
    startDate: '2026-07-10', endDate: '2026-07-12', time: '19:00',
    price: { vip: 242000, r: 198000, s: 154000 }, rating: 4.9, reviewCount: 8970,
    thumbnail: 'https://picsum.photos/seed/blackpink/300/400', poster: 'https://picsum.photos/seed/blackpink/400/560',
    cast: ['BLACKPINK'], status: 'upcoming',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: '멜론티켓', url: 'https://ticket.melon.com' },
    ],
  },
  {
    id: 9, title: '죽은 시인의 사회', category: 'theater', venue: '대학로 자유극장', location: '서울 종로구',
    startDate: '2026-04-01', endDate: '2026-06-30', time: '평일 20:00 / 주말 15:00, 19:00',
    price: { r: 55000, s: 44000 }, rating: 4.8, reviewCount: 1245,
    thumbnail: 'https://picsum.photos/seed/dead-poets/300/400', poster: 'https://picsum.photos/seed/dead-poets/400/560',
    cast: ['김동완', '박건형'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: 'YES24', url: 'https://ticket.yes24.com' },
    ],
  },
  {
    id: 10, title: '정명훈 & 베를린 필하모닉', category: 'classic', venue: '롯데콘서트홀', location: '서울 송파구',
    startDate: '2026-05-25', endDate: '2026-05-25', time: '19:30',
    price: { vip: 250000, r: 180000, s: 120000, a: 80000 }, rating: 4.9, reviewCount: 743,
    thumbnail: 'https://picsum.photos/seed/berlin-phil/300/400', poster: 'https://picsum.photos/seed/berlin-phil/400/560',
    cast: ['정명훈', '베를린 필하모닉 오케스트라'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: 'SAC티켓', url: 'https://www.sacticket.co.kr' },
    ],
  },
  {
    id: 11, title: '시카고', category: 'musical', venue: 'D-CUBE 링크아트센터', location: '서울 구로구',
    startDate: '2026-05-10', endDate: '2026-07-20', time: '평일 19:30 / 주말 14:00, 18:00',
    price: { vip: 150000, r: 120000, s: 90000, a: 60000 }, rating: 4.7, reviewCount: 2105,
    thumbnail: 'https://picsum.photos/seed/chicago/300/400', poster: 'https://picsum.photos/seed/chicago/400/560',
    cast: ['최정원', '아이비', '남경주'], status: 'on_sale',
    ticketSources: [
      { name: '인터파크', url: 'https://tickets.interpark.com' },
      { name: 'YES24', url: 'https://ticket.yes24.com' },
      { name: '멜론티켓', url: 'https://ticket.melon.com' },
    ],
  },
  {
    id: 12, title: 'NewJeans Fan Meeting', category: 'concert', venue: 'KSPO DOME', location: '서울 송파구',
    startDate: '2026-04-26', endDate: '2026-04-27', time: '17:00',
    price: { vip: 132000, r: 99000 }, rating: 4.85, reviewCount: 6234,
    thumbnail: 'https://picsum.photos/seed/newjeans/300/400', poster: 'https://picsum.photos/seed/newjeans/400/560',
    cast: ['NewJeans'], status: 'on_sale',
    ticketSources: [
      { name: '위버스샵', url: 'https://weverse.io' },
      { name: '인터파크', url: 'https://tickets.interpark.com' },
    ],
  },
];

const categories = [
  { id: 'musical', name: '뮤지컬', icon: '🎭', color: '#e74c3c' },
  { id: 'concert', name: '콘서트', icon: '🎤', color: '#3498db' },
  { id: 'theater', name: '연극', icon: '🎪', color: '#2ecc71' },
  { id: 'classic', name: '클래식/오페라', icon: '🎻', color: '#9b59b6' },
];

// Vercel Serverless Function handler
module.exports = (req, res) => {
  const { url, method } = req;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Health
  if (url === '/api/health') {
    return res.end(JSON.stringify({ status: 'ok', service: 'TicketMoa API' }));
  }

  // Categories
  if (url === '/api/categories') {
    return res.end(JSON.stringify(categories));
  }

  // Performance detail
  const detailMatch = url.match(/^\/api\/performances\/(\d+)$/);
  if (detailMatch) {
    const perf = performances.find((p) => p.id === parseInt(detailMatch[1]));
    if (!perf) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: '공연을 찾을 수 없습니다.' }));
    }
    return res.end(JSON.stringify(perf));
  }

  // Performance list
  if (url.startsWith('/api/performances')) {
    const params = new URL(url, 'http://localhost').searchParams;
    const category = params.get('category');
    const search = params.get('search');
    const status = params.get('status');
    const sort = params.get('sort');

    let result = [...performances];

    if (category) result = result.filter((p) => p.category === category);
    if (status) result = result.filter((p) => p.status === status);
    if (search) {
      const kw = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.venue.toLowerCase().includes(kw) ||
          p.cast.some((c) => c.toLowerCase().includes(kw))
      );
    }

    if (sort === 'date') result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    else if (sort === 'popularity') result.sort((a, b) => b.reviewCount - a.reviewCount);

    return res.end(JSON.stringify(result));
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
};
