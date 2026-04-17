# 1. Product Overview

## 1.1 Product Name (working)

Fashion AI Discovery Platform

## 1.2 Problem Statement

Người dùng gặp 3 vấn đề lớn:

* Không tìm được quần áo **đúng màu mong muốn** (color mismatch giữa ảnh vs thực tế)
* Không biết cách **match style aesthetic** (Old Money, Streetwear…)
* Khó discover **brand nhỏ / niche** (bị dominate bởi Zalando, ASOS, fast fashion)

## 1.3 Solution

Một nền tảng:

* Cho phép **search theo màu chính xác (hex / image → Delta E matching)**
* Hiểu **style aesthetic** bằng AI
* Discover **brand độc lạ** bằng AI crawler
* Monetize qua affiliate

---

# 2. Goals & Success Metrics

## 2.1 MVP Goals (12 weeks)

* Users có thể:

  * Upload ảnh → tìm item tương tự
  * Search theo màu (hex / picker)
  * Filter theo style
* Database có:

  * ≥ 5,000 sản phẩm
  * ≥ 100 brands (bao gồm niche brands)
* Affiliate tracking hoạt động end-to-end

## 2.2 KPIs

* Search → Click rate ≥ 20%
* Affiliate conversion ≥ 2–5%
* Avg session time ≥ 2 min
* Repeat usage ≥ 25%

---

# 3. Target Users

## Primary

* Gen Z / Millennials quan tâm fashion
* Người thích phối đồ nhưng không chuyên

## Secondary

* Fashion enthusiasts
* Stylists / content creators

---

# 4. Core Features (MVP Scope)

## 4.1 Color-based Search (Core Engine)

### Input:

* Hex code
* Color picker
* Image upload

### Processing:

* Convert → Lab color space
* Compute Delta E distance

### Output:

* Sorted product list theo similarity

👉 Đây là core moat nếu làm đúng

---

## 4.2 Image → Outfit Matching

### Flow:

1. Upload ảnh (wardrobe item)
2. Gemini API:

   * Detect color palette
   * Detect garment type
   * Detect style
3. Query DB:

   * Similar color
   * Same category
   * Matching style

---

## 4.3 Style Classification

### Predefined styles:

* Old Money
* Streetwear
* Minimalist
* Sporty (subtypes)

### Implementation:

* Tag-based + AI classification (hybrid)
* Gemini hoặc embedding similarity

---

## 4.4 Product Search UI

* Search bar (color / keyword)
* Filters:

  * Style
  * Category
  * Price (optional MVP)
* Grid UI (mobile-first)

---

## 4.5 Affiliate Integration

* AWIN API:

  * Product ingestion
  * Tracking links
* Click → redirect with affiliate tag

---

## 4.6 AI Brand Discovery (Differentiator)

### Objective:

Không phụ thuộc marketplace lớn

### Pipeline:

1. Crawl:

   * Instagram brands
   * Shopify stores
   * niche directories
2. Extract:

   * Brand metadata
   * Product images
3. AI evaluate:

   * Style classification
   * Quality heuristic
4. Store → DB

### Supabase là sweet spot

* Postgres thật → hỗ trợ:

  * vector (pgvector)
  * JSONB
  * relational queries
* Built-in:

  * Auth (nếu cần)
  * Storage (image upload)
  * Edge Functions (API layer)

👉 Kết luận:
**Supabase = fastest path để ship MVP + không bị tech debt sớm**

---

# 2. System Architecture (Final)

## 2.1 High-level

Frontend (Next.js + Shadcn UI)
↓
API Layer:

* Supabase Edge Functions (business logic)
  ↓
  Services:
* Color Matching Engine
* AI Processing (Gemini API)
* Crawler Worker (separate service)
  ↓
  Database:
* Supabase Postgres (pgvector)

---

## 2.2 Optional (nên có sớm)

* Queue system:

  * Upstash Redis / Supabase queue workaround
* Cron jobs:

  * Crawl brands
  * Re-index data

---

# 3. Product Scope (MVP thực tế)

## 3.1 Core Features (must-have)

### F1. Color Search

Input:

* hex (#AABBCC)
* color picker

Logic:

* convert → Lab
* compute Delta E

Output:

* sorted product list

---

### F2. Image Upload → Matching

Flow:

1. Upload image → Supabase Storage
2. Call Gemini API:

   * dominant colors
   * category (shirt, pants…)
   * style
3. Query DB → return matches

---

### F3. Product Listing

* Grid UI
* Basic filters:

  * category
  * style
* Click → affiliate redirect

---

### F4. Style Filtering

Implementation:

* NOT AI first

👉 Do:

* Predefined tags + simple mapping

AI chỉ dùng để:

* auto-tag products offline

---

## 3.2 Defer (đừng làm sớm)

* User accounts
* Wishlist
* Social features
* Real-time sync

---

# 4. Data Model (Production-ready MVP)

## 4.1 products

* id (uuid)
* name
* brand_id
* image_url
* price
* affiliate_url
* category (enum)
* style_tags (text[])
* color_lab (vector(3))
* created_at

---

## 4.2 brands

* id
* name
* source (awin / crawler)
* niche_score (float)
* website_url

---

## 4.3 images (optional)

* id
* product_id
* url
* extracted_colors

---

# 5. Core Logic Design

## 5.1 Color Matching

### Flow:

1. Convert RGB → Lab
2. Store in DB
3. Query:

   * distance(color_lab, input_lab)

### Implementation:

* Use pgvector OR custom function

👉 Practical tip:

* Không cần Delta E chuẩn ngay
* Euclidean distance trong Lab = đủ cho MVP

---

## 5.2 Image Processing

### Gemini API output (example)

```
{
  "colors": ["#AABBCC", "#112233"],
  "category": "shirt",
  "style": ["minimalist"]
}
```

### Then:

* Convert colors → Lab
* Query products

---

## 5.3 Style System

👉 Đừng over-engineer

Start với:

```
["old_money", "streetwear", "minimalist", "sporty"]
```

Mapping:

* AI → tag
* Product → tag

---

# 6. AI Usage Strategy (Cost-aware)

## 6.1 Use AI ONLY for:

* Image analysis
* Product tagging (offline)

## 6.2 Avoid AI for:

* Search
* Filtering
* Ranking

👉 Rule:
**AI = enrichment, NOT runtime dependency**

---

# 7. Crawler Strategy (Reality Check)

## 7.1 MVP Approach

👉 Không build full crawler ngay

Instead:

* Seed data từ:

  * AWIN
  * manual curated brands
* Simple scraper:

  * 5–10 niche sites

---

## 7.2 Phase 2

* Build crawler:

  * Playwright
  * queue-based
  * store raw HTML → process later

---

# 8. API Design (Minimal)

## 8.1 Search by Color

POST /search/color

Input:

```
{
  "hex": "#AABBCC"
}
```

Output:

* product list sorted by distance

---

## 8.2 Upload Image

POST /analyze-image

* upload file
* return:

  * colors
  * category
  * style

---

## 8.3 Search by Image Result

POST /search/match

Input:

```
{
  "colors": [...],
  "category": "shirt"
}
```

---

# 9. Frontend Structure (Next.js)

## Pages

* /

  * search UI
* /results
* /product/[id]

---

## Components

* ColorPicker
* ImageUploader
* ProductGrid
* Filters

---

# 10. UX Principles (quan trọng hơn bạn nghĩ)

* Instant feedback:

  * preview image ngay
* Fast results:

  * skeleton loading
* Mobile-first

---

# 11. Build Plan (thực chiến)

## Week 1–2

* Setup Next.js + Supabase
* DB schema
* Product seed data

## Week 3–4

* Color search working

## Week 5–6

* Image upload + Gemini integration

## Week 7–8

* Filters + UI polish

## Week 9–10

* Affiliate integration

## Week 11–12

* Basic crawler + optimization

---

# 12. Biggest Mistakes cần tránh

## 1. Over-engineer AI

→ bạn sẽ chết vì cost + latency

## 2. Build crawler quá sớm

→ không có data quality

## 3. Không seed data

→ app trống = fail

## 4. Chạy theo feature thay vì UX

→ người dùng không quay lại

---

# 13. Final Stack (clear decision)

Frontend:

* Next.js
* Shadcn UI

Backend:

* Supabase (Postgres + Edge Functions)

AI:

* Gemini API

Crawler:

* Playwright (phase 2)

Infra:

* Vercel