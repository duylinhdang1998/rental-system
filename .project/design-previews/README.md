# Dashboard Style Comparison

Ba ảnh dùng cùng thông tin chức năng để so sánh phong cách, không phải so sánh ba bố cục khác nhau.

## Files

| Option | Style | File |
|---:|---|---|
| 1 | Operational Minimal | `01-operational-minimal.png` |
| 2 | Warm Hospitality | `02-warm-hospitality.png` |
| 3 | Soft Modern | `03-soft-modern.png` |

## Shared Prompt Contract

```text
Use case: ui-mockup
Asset type: high-fidelity desktop React SPA admin dashboard
Product: Vietnamese motorcycle rental management system
Canvas: front-facing 16:10 desktop application screenshot
Layout: left sidebar; top search/header; five KPI cards; “Xe trả hôm nay” table; “Cần xử lý” panel; “DỮ LIỆU MINH HỌA” badge
Navigation: Tổng quan, Xe, Khách hàng, Hợp đồng, Nhận trả, Thanh toán, Báo cáo, Nhân viên, Cấu hình
KPIs: Xe sẵn sàng 18; Đang thuê 26; Trả hôm nay 7; Quá hạn 3; Công nợ 12,4 triệu
Constraints: practical implementable UI; readable Vietnamese; no company/trademark logos; no watermark; no device frame; no glass effects; same information architecture for all variants
```

## Option-Specific Prompts

### 1 — Operational Minimal

```text
Style: shippable B2B operations UI, light Linear/Vercel-inspired minimalism
Palette: white/light neutral, slate text, blue #2563EB primary, semantic green/blue/purple/amber/red
Details: compact 8px spacing, 8px radius, hairline borders, nearly no shadow, Inter/Geist-like typography, data-dense tables
```

### 2 — Warm Hospitality

```text
Style: warm minimalism, calm boutique travel/hospitality feeling while remaining operational
Palette: ivory #FAF6F0, white surfaces, olive #3F4A3C, clay #C08457, warm dark text #2E2A25
Details: 14px radius, subtle warm borders/shadows, humanist sans, more breathing room, tasteful vehicle thumbnail placeholders
```

### 3 — Soft Modern

```text
Style: friendly, airy, rounded consumer-app feel adapted to operations
Palette: off-white #FFFDF9, violet #7C6BF5, pink #FF8FB1, mint #57C7A0, dark text #2B2A33
Details: 18–24px rounded cards, pill controls, soft shadows, rounded sans, touch-friendly spacing, practical hybrid table/list
```

## Decision

Design system and detailed desktop/mobile wireframes remain blocked until the client chooses option 1, 2 or 3 (or requests a hybrid with explicit elements from each).

