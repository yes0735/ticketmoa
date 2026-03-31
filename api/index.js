const express = require('express');
const cors = require('cors');

const { performances: sampleData, categories } = require('../ticketmoa-server/data/performances');

const app = express();
app.use(cors());
app.use(express.json());

// =============================================
// DB row → 프론트엔드 JSON 변환 (DB 연동 시 사용)
// =============================================
function parsePrice(pcseguidance) {
  if (!pcseguidance) return 0;
  const matches = pcseguidance.match(/[\d,]+원/g);
  if (!matches) return 0;
  const prices = matches.map((m) => parseInt(m.replace(/[,원]/g, '')) || 0);
  return Math.min(...prices);
}

function buildTicketSources(title) {
  const encoded = encodeURIComponent(title || '');
  return [
    { name: '인터파크', url: `https://tickets.interpark.com/search?keyword=${encoded}` },
    { name: 'YES24', url: `https://ticket.yes24.com/search/search.aspx?query=${encoded}` },
    { name: '멜론티켓', url: `https://ticket.melon.com/search/index.htm?q=${encoded}` },
  ];
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TicketMoa API', dataSource: 'Sample Data' });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Performances
app.get('/api/performances', (req, res) => {
  const { category, search, status, sort } = req.query;
  let result = [...sampleData];

  if (category) result = result.filter((p) => p.category === category);
  if (status) result = result.filter((p) => p.status === status);
  if (search) {
    const keyword = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword) ||
        p.venue.toLowerCase().includes(keyword) ||
        p.cast.some((c) => c.toLowerCase().includes(keyword))
    );
  }

  if (sort === 'date') result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  else if (sort === 'popularity') result.sort((a, b) => b.reviewCount - a.reviewCount);

  res.json(result);
});

// Performance detail
app.get('/api/performances/:id', (req, res) => {
  const performance = sampleData.find((p) => p.id === parseInt(req.params.id));
  if (!performance) {
    return res.status(404).json({ error: '공연을 찾을 수 없습니다.' });
  }
  res.json(performance);
});

module.exports = app;
