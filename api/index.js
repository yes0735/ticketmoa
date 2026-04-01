const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

const categories = [
  { id: 'musical', name: '뮤지컬', icon: '🎭', color: '#111111' },
  { id: 'concert', name: '대중음악', icon: '🎤', color: '#333333' },
  { id: 'theater', name: '연극', icon: '🎪', color: '#555555' },
  { id: 'classic', name: '서양음악(클래식)', icon: '🎻', color: '#222222' },
  { id: 'dance', name: '무용', icon: '💃', color: '#444444' },
  { id: 'etc', name: '서커스/복합', icon: '🎪', color: '#777777' },
];

function parsePrice(pcseguidance) {
  if (!pcseguidance) return 0;
  const matches = pcseguidance.match(/[\d,]+원/g);
  if (!matches) return 0;
  const prices = matches.map((m) => parseInt(m.replace(/[,원]/g, '')) || 0);
  return Math.min(...prices);
}

function buildTicketSources(row) {
  if (row.relates) {
    const relates = typeof row.relates === 'string' ? JSON.parse(row.relates) : row.relates;
    if (Array.isArray(relates) && relates.length > 0) {
      return relates.map((r) => ({ name: r.name, url: r.url }));
    }
  }
  const title = encodeURIComponent(row.prfnm || '');
  return [
    { name: '놀유니버스', url: `https://www.globalinterpark.com/search?keyword=${title}` },
    { name: '예스24', url: `https://ticket.yes24.com/search/search.aspx?query=${title}` },
    { name: '멜론티켓', url: `https://ticket.melon.com/search/index.htm?q=${title}` },
  ];
}

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
    lowestPrice,
    runtime: row.prfruntime || '',
    age: row.prfage || '',
    description: row.sty || '',
    styImages: row.styurls || [],
    ticketSources: buildTicketSources(row),
  };
}

module.exports = async (req, res) => {
  const { url } = req;
  const db = getPool();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Health
  if (url === '/api/health') {
    return res.end(JSON.stringify({ status: 'ok', service: 'TicketMoa API', dataSource: db ? 'PostgreSQL' : 'none' }));
  }

  // Categories
  if (url === '/api/categories') {
    return res.end(JSON.stringify(categories));
  }

  // Ticket Sources (DB 기반 동적 목록)
  if (url === '/api/ticket-sources') {
    if (!db) return res.end(JSON.stringify([]));
    try {
      const { rows } = await db.query(
        `SELECT name, COUNT(*) as cnt FROM (
          SELECT jsonb_array_elements(relates)->>'name' AS name
          FROM performances
          WHERE relates IS NOT NULL AND relates != '[]'::jsonb
        ) t
        WHERE name IS NOT NULL AND TRIM(name) != ''
        GROUP BY name ORDER BY cnt DESC`
      );
      return res.end(JSON.stringify(rows.map((r) => ({ id: r.name, name: r.name, count: parseInt(r.cnt) }))));
    } catch (err) {
      console.error('ticket-sources error:', err.message);
      return res.end(JSON.stringify([]));
    }
  }

  // Performance detail
  const detailMatch = url.match(/^\/api\/performances\/([^?]+)/);
  if (detailMatch && !url.startsWith('/api/performances?')) {
    if (!db) { res.statusCode = 500; return res.end(JSON.stringify({ error: 'DB not configured' })); }
    try {
      const { rows } = await db.query('SELECT * FROM performances WHERE mt20id = $1', [detailMatch[1]]);
      if (rows.length === 0) { res.statusCode = 404; return res.end(JSON.stringify({ error: '공연을 찾을 수 없습니다.' })); }
      return res.end(JSON.stringify(mapRowToPerformance(rows[0])));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Performance list
  if (url.startsWith('/api/performances')) {
    if (!db) return res.end(JSON.stringify([]));

    try {
      const params_url = new URL(url, 'http://localhost').searchParams;
      const category = params_url.get('category');
      const search = params_url.get('search');
      const status = params_url.get('status');
      const sort = params_url.get('sort');
      const ticketSource = params_url.get('ticketSource');
      const page = parseInt(params_url.get('page') || '1');
      const limit = parseInt(params_url.get('limit') || '50');

      let sql = 'SELECT * FROM performances WHERE 1=1';
      const qParams = [];
      let paramIdx = 1;

      if (category) {
        const cats = category.split(',');
        if (cats.length === 1) {
          sql += ` AND category = $${paramIdx++}`;
          qParams.push(cats[0]);
        } else {
          sql += ` AND category = ANY($${paramIdx++})`;
          qParams.push(cats);
        }
      }

      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        qParams.push(status);
      }

      if (search) {
        sql += ` AND (prfnm ILIKE $${paramIdx} OR fcltynm ILIKE $${paramIdx} OR prfcast ILIKE $${paramIdx})`;
        qParams.push(`%${search}%`);
        paramIdx++;
      }

      if (ticketSource) {
        const sources = ticketSource.split(',');
        const conditions = sources.map((s) => {
          qParams.push(`%${s}%`);
          return `relates::text ILIKE $${paramIdx++}`;
        });
        sql += ` AND (${conditions.join(' OR ')})`;
      }

      if (!status) {
        sql += ` AND status != 'completed'`;
      }

      if (sort === 'date') {
        sql += ' ORDER BY prfpdfrom ASC';
      } else if (sort === 'popularity') {
        sql += ' ORDER BY synced_at DESC';
      } else {
        sql += " ORDER BY CASE status WHEN 'on_sale' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END, prfpdfrom ASC";
      }

      const offset = (page - 1) * limit;
      sql += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
      qParams.push(limit, offset);

      const { rows } = await db.query(sql, qParams);
      return res.end(JSON.stringify(rows.map(mapRowToPerformance)));
    } catch (err) {
      console.error('performances error:', err.message);
      return res.end(JSON.stringify([]));
    }
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
};
