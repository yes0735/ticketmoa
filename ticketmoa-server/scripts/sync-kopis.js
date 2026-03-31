/**
 * KOPIS 공연 정보 동기화 배치 스크립트
 *
 * 실행: node scripts/sync-kopis.js
 *
 * 1. 공연예정(01) + 공연중(02) 목록을 페이지네이션으로 전체 조회
 * 2. PostgreSQL에 upsert
 * 3. 상세 정보가 없는 공연(has_detail=false)의 상세 정보를 추가 조회
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const db = require('../db');
const { fetchPerformances, fetchPerformanceDetail, formatDate } = require('../services/kopisApi');

const SERVICE_KEY = process.env.KOPIS_API_KEY;
const DETAIL_DELAY_MS = 300; // API 호출 간격 (ms)
const ROWS_PER_PAGE = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureSchema() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await db.query(sql);
  console.log('[INIT] Database schema ensured.');
}

/**
 * 공연 목록을 페이지네이션하며 전체 조회
 */
async function fetchAllPerformances(prfstate, stdate, eddate) {
  const all = [];
  let cpage = 1;

  while (true) {
    console.log(`  [LIST] prfstate=${prfstate}, page=${cpage}...`);

    const items = await fetchPerformances(SERVICE_KEY, {
      prfstate,
      stdate,
      eddate,
      cpage,
      rows: ROWS_PER_PAGE,
    });

    if (items.length === 0) break;

    all.push(...items);
    console.log(`  [LIST] page ${cpage}: ${items.length}건 조회`);

    if (items.length < ROWS_PER_PAGE) break;
    cpage++;
  }

  return all;
}

/**
 * 공연 목록 데이터를 DB에 upsert
 */
async function upsertPerformances(items) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      await client.query(
        `INSERT INTO performances (
          mt20id, prfnm, prfpdfrom, prfpdto, fcltynm, poster,
          genrenm, prfstate, openrun, area, category, status, synced_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
        ON CONFLICT (mt20id) DO UPDATE SET
          prfnm = EXCLUDED.prfnm,
          prfpdfrom = EXCLUDED.prfpdfrom,
          prfpdto = EXCLUDED.prfpdto,
          fcltynm = EXCLUDED.fcltynm,
          poster = EXCLUDED.poster,
          genrenm = EXCLUDED.genrenm,
          prfstate = EXCLUDED.prfstate,
          openrun = EXCLUDED.openrun,
          area = EXCLUDED.area,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          synced_at = NOW()`,
        [
          item.mt20id, item.prfnm, item.prfpdfrom, item.prfpdto,
          item.fcltynm, item.poster, item.genrenm, item.prfstate,
          item.openrun, item.area, item.category, item.status,
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`[UPSERT] ${items.length}건 저장 완료.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 상세 정보가 없는 공연의 상세 정보를 조회하여 업데이트
 */
async function syncDetails() {
  const { rows } = await db.query(
    `SELECT mt20id FROM performances WHERE has_detail = FALSE ORDER BY synced_at DESC`
  );

  console.log(`[DETAIL] 상세 조회 대상: ${rows.length}건`);

  let success = 0;
  let fail = 0;

  for (const row of rows) {
    try {
      const detail = await fetchPerformanceDetail(SERVICE_KEY, row.mt20id);

      if (!detail) {
        fail++;
        continue;
      }

      await db.query(
        `UPDATE performances SET
          mt10id = $2,
          prfcast = $3,
          prfcrew = $4,
          prfruntime = $5,
          prfage = $6,
          entrpsnm_p = $7,
          entrpsnm_a = $8,
          entrpsnm_h = $9,
          entrpsnm_s = $10,
          pcseguidance = $11,
          poster = $12,
          sty = $13,
          dtguidance = $14,
          styurls = $15,
          area = $16,
          visit = $17,
          child = $18,
          daehakro = $19,
          festival = $20,
          updatedate = $21,
          has_detail = TRUE,
          synced_at = NOW()
        WHERE mt20id = $1`,
        [
          detail.mt20id, detail.mt10id,
          detail.prfcast, detail.prfcrew, detail.prfruntime, detail.prfage,
          detail.entrpsnm_p, detail.entrpsnm_a, detail.entrpsnm_h, detail.entrpsnm_s,
          detail.pcseguidance, detail.poster, detail.sty, detail.dtguidance,
          detail.styurls, detail.area,
          detail.visit, detail.child, detail.daehakro, detail.festival,
          detail.updatedate || null,
        ]
      );

      success++;

      if (success % 50 === 0) {
        console.log(`  [DETAIL] ${success}건 완료...`);
      }

      await sleep(DETAIL_DELAY_MS);
    } catch (err) {
      console.error(`  [DETAIL] ${row.mt20id} 실패:`, err.message);
      fail++;
      await sleep(DETAIL_DELAY_MS);
    }
  }

  console.log(`[DETAIL] 완료 - 성공: ${success}건, 실패: ${fail}건`);
}

async function main() {
  console.log('=== TicketMoa KOPIS 동기화 시작 ===');
  console.log(`시각: ${new Date().toISOString()}`);

  if (!SERVICE_KEY) {
    console.error('KOPIS_API_KEY가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!db.pool) {
    console.error('DATABASE_URL이 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 1. 스키마 초기화
    await ensureSchema();

    // 2. 공연중(02) 목록 조회
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    console.log('\n[PHASE 1] 공연중 목록 조회...');
    const onSale = await fetchAllPerformances('02', formatDate(threeMonthsAgo), formatDate(now));

    console.log('\n[PHASE 2] 공연예정 목록 조회...');
    const upcoming = await fetchAllPerformances('01', formatDate(now), formatDate(sixMonthsLater));

    // 3. DB 저장
    const allItems = [...onSale, ...upcoming];
    console.log(`\n[PHASE 3] 총 ${allItems.length}건 DB 저장...`);

    if (allItems.length > 0) {
      await upsertPerformances(allItems);
    }

    // 4. 상세 정보 조회
    console.log('\n[PHASE 4] 상세 정보 조회...');
    await syncDetails();

    // 5. 완료된 공연 상태 업데이트
    await db.query(
      `UPDATE performances SET status = 'completed' WHERE prfstate = '공연완료' AND status != 'completed'`
    );

    const { rows: [{ count }] } = await db.query('SELECT COUNT(*) as count FROM performances');
    console.log(`\n=== 동기화 완료 (DB 총 ${count}건) ===`);

  } catch (err) {
    console.error('동기화 실패:', err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
