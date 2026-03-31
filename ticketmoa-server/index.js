const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { performances: sampleData, categories } = require('./data/performances');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const USE_DB = !!db.pool;

app.use(cors());
app.use(express.json());

// =============================================
// DB row → 프론트엔드 JSON 변환
// =============================================
function mapRowToPerformance(row) {
  const lowestPrice = parsePrice(row.pcseguidance);
  return {
    id: row.mt20id,
    title: row.prfnm,
    startDate: row.prfpdfrom ? row.prfpdfrom.toISOString().split('T')[0] : '',
    endDate: row.prfpdto ? row.prfpdto.toISOString().split('T')[0] : '',
    venue: row.fcltynm || '',
    location: row.area || '',
    poster: row.poster || '',
    thumbnail: row.poster || '',
    genre: row.genrenm || '',
    category: row.category || 'etc',
    status: row.status || 'unknown',
    openRun: row.openrun === 'Y',
    cast: row.prfcast ? row.prfcast.split(',').map((s) => s.trim()) : [],
    time: row.dtguidance || '',
    price: row.pcseguidance || '',
    lowestPrice: lowestPrice,
    runtime: row.prfruntime || '',
    age: row.prfage || '',
    description: row.sty || '',
    styImages: row.styurls || [],
    ticketSources: buildTicketSources(row),
  };
}

function parsePrice(pcseguidance) {
  if (!pcseguidance) return 0;
  const matches = pcseguidance.match(/[\d,]+원/g);
  if (!matches) return 0;
  const prices = matches.map((m) => parseInt(m.replace(/[,원]/g, '')) || 0);
  return Math.min(...prices);
}

function buildTicketSources(row) {
  const sources = [];
  const title = encodeURIComponent(row.prfnm || '');

  sources.push({
    name: '인터파크',
    url: `https://tickets.interpark.com/search?keyword=${title}`,
  });
  sources.push({
    name: 'YES24',
    url: `https://ticket.yes24.com/search/search.aspx?query=${title}`,
  });
  sources.push({
    name: '멜론티켓',
    url: `https://ticket.melon.com/search/index.htm?q=${title}`,
  });

  return sources;
}

// =============================================
// API 엔드포인트
// =============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TicketMoa API',
    dataSource: USE_DB ? 'PostgreSQL' : 'Sample Data',
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// 공연 목록
app.get('/api/performances', async (req, res) => {
  if (USE_DB) {
    try {
      const { category, search, status, sort, page = 1, limit = 50 } = req.query;

      let sql = 'SELECT * FROM performances WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (category) {
        sql += ` AND category = $${paramIdx++}`;
        params.push(category);
      }

      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }

      if (search) {
        sql += ` AND (prfnm ILIKE $${paramIdx} OR fcltynm ILIKE $${paramIdx} OR prfcast ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      // 기본: 공연완료 제외
      if (!status) {
        sql += ` AND status != 'completed'`;
      }

      if (sort === 'date') {
        sql += ' ORDER BY prfpdfrom ASC';
      } else if (sort === 'popularity') {
        sql += ' ORDER BY synced_at DESC';
      } else {
        sql += ' ORDER BY CASE status WHEN \'on_sale\' THEN 1 WHEN \'upcoming\' THEN 2 ELSE 3 END, prfpdfrom ASC';
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      sql += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
      params.push(parseInt(limit), offset);

      const { rows } = await db.query(sql, params);
      res.json(rows.map(mapRowToPerformance));
    } catch (err) {
      console.error('DB query failed, falling back to sample:', err.message);
      serveSampleList(req, res);
    }
  } else {
    serveSampleList(req, res);
  }
});

// 공연 상세
app.get('/api/performances/:id', async (req, res) => {
  if (USE_DB && req.params.id.startsWith('PF')) {
    try {
      const { rows } = await db.query(
        'SELECT * FROM performances WHERE mt20id = $1',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: '공연을 찾을 수 없습니다.' });
      }
      res.json(mapRowToPerformance(rows[0]));
    } catch (err) {
      console.error('DB query failed:', err.message);
      res.status(500).json({ error: '공연 조회에 실패했습니다.' });
    }
  } else {
    const performance = sampleData.find((p) => p.id === parseInt(req.params.id));
    if (!performance) {
      return res.status(404).json({ error: '공연을 찾을 수 없습니다.' });
    }
    res.json(performance);
  }
});

// =============================================
// 샘플 데이터 핸들러
// =============================================
function serveSampleList(req, res) {
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
}

// Production: 빌드된 React 앱 서빙
const clientDist = path.join(__dirname, '..', 'ticketmoa-client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TicketMoa running on http://localhost:${PORT}`);
  console.log(`Data source: ${USE_DB ? 'PostgreSQL' : 'Sample Data (DATABASE_URL 미설정)'}`);
});
