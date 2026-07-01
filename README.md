# news-cloudflare

Cloudflare 기반 대규모 언론사형 수익화 플랫폼입니다. Astro SSR, TypeScript, D1, KV, Durable Objects(SQLite), Gemini AI 작성 보조를 사용하며 R2는 사용하지 않습니다.

## 완성된 기능 범위

### 공개 뉴스 사이트

- 반응형 홈, 카테고리, 태그, 트렌딩, 검색, 기사 상세, 작성자/기자 프로필, 회사소개, 편집정책, 개인정보처리방침 페이지.
- 기본 SEO 메타, Open Graph, Twitter Card, JSON-LD, RSS, sitemap, robots.txt.
- AdSense 수익화를 위한 레이아웃 안정 광고 슬롯과 편집/광고 구분 정책.

### 관리자/편집 기능

- `/admin` 보안 콘솔에서 Gemini AI 기사 초안 생성.
- 수동 기사 생성 API, 기사 목록 API, 게시 승인 API.
- 생성되는 모든 게시물 슬러그는 제목에서만 만들며, 한글/특수 문자는 퍼센트 인코딩된 URL 안전 슬러그로 저장합니다.
- SEO 점수 점검 API 및 AI 생성 기사에 대한 SEO 감사 저장.
- 조회수 1,000 이상 알림 후보를 Durable Object와 KV로 큐잉.
- 정정 요청, 뉴스레터 구독, 헬스체크, 운영 지표, 브라우저 푸시 구독, 작성자 관리, 기사 리비전/감사 로그를 지원합니다.
- 관리자 API는 `ADMIN_TOKEN` Bearer 토큰을 요구합니다.

### 저장소/아키텍처

- **D1**: 기사, 작성자, 미디어 메타데이터, 트래픽 이벤트, 알림, SEO 감사, 관리자 감사 로그.
- **Durable Objects(SQLite)**: 기사별 조회수 집계와 고트래픽 알림 큐 조정.
- **KV**: 알림 큐, base64 청크형 미디어 저장소, 세션 바인딩.
- **R2 금지**: base64 데이터를 압축/분할 저장할 수 있도록 `putBase64Asset`, `getBase64Asset`, `chunkBase64` 유틸리티를 제공합니다.

## 시작하기

```bash
npm install
npm run build
```

## Cloudflare 설정

1. `wrangler.toml`의 D1/KV ID를 실제 리소스 ID로 교체합니다.
2. D1에 `db/schema.sql`을 적용합니다.
3. 시크릿을 등록합니다.

```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put ADMIN_TOKEN
```

## 주요 API

- `POST /api/admin/generate`: Gemini AI 기사 초안 생성 + D1 draft 저장 + SEO 감사.
- `GET|POST /api/admin/articles`: 관리자 기사 목록 및 수동 기사 생성.
- `PATCH /api/admin/articles/:id`: 기사 수정, 상태 변경, 리비전 저장, 감사 로그 기록.
- `GET|POST /api/admin/authors`: 기자/편집자 목록 및 작성자 관리.
- `POST /api/admin/articles/:id/publish`: 초안 게시 승인.
- `POST /api/admin/seo-audit`: SEO 점수 점검.
- `POST /api/admin/media/base64`: R2 없이 base64 미디어를 KV 청크로 저장.
- `GET /api/admin/notifications`: 알림 큐 확인.
- `GET|PUT /api/admin/settings`: 사이트명, 알림 기준, 광고 설정 등 운영 설정 관리.
- `GET /api/admin/metrics`: 기사/조회수/초안/알림 운영 지표 확인.
- `POST /api/notifications/subscribe`: 브라우저 푸시 구독 저장.
- `POST /api/corrections`: 기사 정정/반론 요청 접수.
- `GET /api/admin/corrections`: 관리자 정정 요청 목록 조회.
- `POST /api/newsletter/subscribe`: 뉴스레터 구독 저장.
- `GET /api/health`: D1/KV/DO 헬스체크.
- `POST /api/view`: 기사 조회수 증가 및 Durable Object 집계.

## 품질 원칙

- AI 생성물은 편집자 검수 전 `draft`로만 저장합니다.
- 광고 영역은 CLS를 줄이도록 예약 높이를 둡니다.
- 전역 보안 미들웨어, 보안 헤더, 관리자 토큰 검사, 공개 쓰기 API rate limit을 기본값으로 사용합니다.
- 큰 미디어는 R2 대신 D1/KV/DO 조합을 전제로 base64 청크로 관리합니다.
