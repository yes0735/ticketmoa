# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TicketMoa는 공연(뮤지컬, 콘서트, 연극, 클래식) 정보를 KOPIS API에서 수집하여 보여주는 풀스택 모노레포 프로젝트. React 프론트엔드 + Express 백엔드 구조이며, Vercel에 배포된다.

## Commands

```bash
# 개발 (클라이언트 3000 + 서버 5000 동시 실행)
npm run dev

# 개별 실행
npm run dev:client    # Vite dev server (port 3000)
npm run dev:server    # Express with --watch (port 5000)

# 빌드
npm run build         # 클라이언트 빌드 + 서버 설치

# 린트 (클라이언트만)
cd ticketmoa-client && npm run lint

# DB 초기화 및 KOPIS 데이터 동기화
cd ticketmoa-server && npm run db:init
cd ticketmoa-server && npm run sync
```

## Architecture

### 데이터 흐름
```
GitHub Actions (매일 01:00 KST) → KOPIS API (XML) → xml2js 파싱 → PostgreSQL upsert
클라이언트 → Vite proxy(dev) / Vercel(prod) → Express / Serverless Function → PostgreSQL 또는 샘플데이터 fallback
```

### 프론트엔드 (`ticketmoa-client/`)
- **React 19 + Vite 8** — JSX (TypeScript 미사용)
- **React Router v7** — SPA 라우팅 (`/`, `/performances`)
- **CSS 변수 기반 모바일 퍼스트 디자인** — max-width 640px, safe-area-inset 지원
- `pages/HomePage.jsx` — 히어로 검색, 카테고리 칩, 공연 섹션
- `pages/PerformanceListPage.jsx` — 필터, 검색, 페이지네이션
- `components/PerformanceCard.jsx` — 확장 가능한 카드 (상세정보 토글, 티켓링크)

### 백엔드 (`ticketmoa-server/`)
- **Express 5 + node-postgres (pg)**
- DB 연결 실패 시 `data/performances.js`의 샘플 데이터로 자동 fallback
- `services/kopisApi.js` — KOPIS XML API 클라이언트
- `scripts/sync-kopis.js` — 배치 동기화 (목록 조회 → upsert → 상세 조회)

### API 엔드포인트
| Endpoint | 설명 |
|----------|------|
| `GET /api/health` | 서버 상태 |
| `GET /api/categories` | 카테고리 목록 (musical, concert, theater, classic) |
| `GET /api/performances` | 공연 목록 (쿼리: category, status, search, sort, page, limit) |
| `GET /api/performances/:id` | 공연 상세 |

### 배포 구조
- **Vercel**: 클라이언트 → `ticketmoa-client/dist`, API → `api/index.js` (Serverless Function)
- **`vercel.json`**: `/api/*` → serverless, 나머지 → SPA fallback (`index.html`)
- **GitHub Actions**: 일일 KOPIS 동기화 크론잡 (`sync-kopis.yml`)

### DB 스키마
- 단일 `performances` 테이블 (PK: `mt20id`, 34개 컬럼)
- 장르 매핑: KOPIS 한글 장르명 → category (musical/concert/theater/classic)
- 상태 매핑: 공연예정/공연중/공연완료 → upcoming/on_sale/completed
- 가격 파싱: pcseguidance 문자열에서 최저가 추출

## Environment Variables

- `DATABASE_URL` — PostgreSQL 연결 문자열 (없으면 샘플 데이터 fallback)
- `KOPIS_API_KEY` — KOPIS API 인증키 (동기화에 필요)
- `PORT` — 서버 포트 (기본 5000)
