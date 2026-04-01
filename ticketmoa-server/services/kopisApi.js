const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const BASE_URL = 'http://www.kopis.or.kr/openApi/restful';

// 장르 코드 매핑
const GENRE_CODES = {
  theater: 'AAAA',     // 연극
  dance: 'BBBC',       // 무용
  classic: 'CCCA',     // 클래식(서양음악)
  korean: 'CCCC',      // 국악
  concert: 'CCCD',     // 대중음악
  complex: 'EEEA',     // 복합
  circus: 'EEEB',      // 서커스/마술
  musical: 'GGGA',     // 뮤지컬
};

// 장르명 → 카테고리 매핑
const GENRE_NAME_TO_CATEGORY = {
  '연극': 'theater',
  '무용(서양/한국무용)': 'dance',
  '대중무용': 'dance',
  '서양음악(클래식)': 'classic',
  '한국음악(국악)': 'classic',
  '대중음악': 'concert',
  '뮤지컬': 'musical',
  '서커스/마술': 'etc',
  '복합': 'etc',
};

// 공연 상태 매핑
const STATE_MAP = {
  '공연예정': 'upcoming',
  '공연중': 'on_sale',
  '공연완료': 'completed',
};

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 */
function formatDate(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * KOPIS 날짜 (YYYY.MM.DD) → ISO 형식 (YYYY-MM-DD)
 */
function parseKopisDate(dateStr) {
  if (!dateStr) return null;
  return dateStr.replace(/\./g, '-');
}

/**
 * XML 응답을 파싱
 */
async function parseXml(xml) {
  return parseStringPromise(xml, {
    explicitArray: false,
    trim: true,
  });
}

/**
 * 안전하게 값을 추출
 */
function extractValue(val) {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

/**
 * 공연 목록 조회
 */
async function fetchPerformances(serviceKey, options = {}) {
  const {
    stdate,
    eddate,
    cpage = 1,
    rows = 100,
    category,
    keyword,
    prfstate,
  } = options;

  const now = new Date();
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const params = {
    service: serviceKey,
    stdate: stdate || formatDate(now),
    eddate: eddate || formatDate(threeMonthsLater),
    cpage,
    rows,
  };

  if (category && GENRE_CODES[category]) {
    params.shcate = GENRE_CODES[category];
  }
  if (keyword) {
    params.shprfnm = keyword;
  }
  if (prfstate) {
    params.prfstate = prfstate;
  }

  const response = await axios.get(`${BASE_URL}/pblprfr`, { params, timeout: 30000 });
  const parsed = await parseXml(response.data);

  if (!parsed.dbs || !parsed.dbs.db) {
    return [];
  }

  const items = Array.isArray(parsed.dbs.db) ? parsed.dbs.db : [parsed.dbs.db];

  return items.map((item) => ({
    mt20id: extractValue(item.mt20id),
    prfnm: extractValue(item.prfnm),
    prfpdfrom: parseKopisDate(extractValue(item.prfpdfrom)),
    prfpdto: parseKopisDate(extractValue(item.prfpdto)),
    fcltynm: extractValue(item.fcltynm),
    poster: extractValue(item.poster),
    genrenm: extractValue(item.genrenm),
    prfstate: extractValue(item.prfstate),
    openrun: extractValue(item.openrun),
    area: extractValue(item.area),
    category: GENRE_NAME_TO_CATEGORY[extractValue(item.genrenm)] || 'etc',
    status: STATE_MAP[extractValue(item.prfstate)] || 'unknown',
  }));
}

/**
 * 공연 상세 조회
 */
async function fetchPerformanceDetail(serviceKey, mt20id) {
  const response = await axios.get(`${BASE_URL}/pblprfr/${mt20id}`, {
    params: { service: serviceKey },
    timeout: 30000,
  });

  const parsed = await parseXml(response.data);

  if (!parsed.dbs || !parsed.dbs.db) {
    return null;
  }

  const item = Array.isArray(parsed.dbs.db) ? parsed.dbs.db[0] : parsed.dbs.db;

  let styurls = [];
  if (item.styurls && item.styurls.styurl) {
    styurls = Array.isArray(item.styurls.styurl)
      ? item.styurls.styurl
      : [item.styurls.styurl];
  }

  let relates = [];
  if (item.relates && item.relates.relate) {
    const relateItems = Array.isArray(item.relates.relate)
      ? item.relates.relate
      : [item.relates.relate];
    relates = relateItems.map((r) => ({
      name: extractValue(r.relatenm),
      url: extractValue(r.relateurl),
    })).filter((r) => r.name && r.url);
  }

  return {
    mt20id: extractValue(item.mt20id),
    mt10id: extractValue(item.mt10id),
    prfnm: extractValue(item.prfnm),
    prfpdfrom: parseKopisDate(extractValue(item.prfpdfrom)),
    prfpdto: parseKopisDate(extractValue(item.prfpdto)),
    fcltynm: extractValue(item.fcltynm),
    prfcast: extractValue(item.prfcast),
    prfcrew: extractValue(item.prfcrew),
    prfruntime: extractValue(item.prfruntime),
    prfage: extractValue(item.prfage),
    entrpsnm_p: extractValue(item.entrpsnmP),
    entrpsnm_a: extractValue(item.entrpsnmA),
    entrpsnm_h: extractValue(item.entrpsnmH),
    entrpsnm_s: extractValue(item.entrpsnmS),
    pcseguidance: extractValue(item.pcseguidance),
    poster: extractValue(item.poster),
    sty: extractValue(item.sty),
    genrenm: extractValue(item.genrenm),
    prfstate: extractValue(item.prfstate),
    openrun: extractValue(item.openrun),
    visit: extractValue(item.visit),
    child: extractValue(item.child),
    daehakro: extractValue(item.daehakro),
    festival: extractValue(item.festival),
    dtguidance: extractValue(item.dtguidance),
    styurls,
    relates,
    area: extractValue(item.area),
    updatedate: extractValue(item.updatedate),
    category: GENRE_NAME_TO_CATEGORY[extractValue(item.genrenm)] || 'etc',
    status: STATE_MAP[extractValue(item.prfstate)] || 'unknown',
  };
}

module.exports = {
  fetchPerformances,
  fetchPerformanceDetail,
  formatDate,
  parseKopisDate,
  GENRE_CODES,
  GENRE_NAME_TO_CATEGORY,
  STATE_MAP,
};
