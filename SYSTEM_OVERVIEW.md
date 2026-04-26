# 🛡️ ReviewVetter: System Brain & Architectural Overview

## 🎯 Mission Statement
ReviewVetter is an **E-commerce Intelligence Suite** designed to bridge the gap between qualitative customer feedback and quantitative business growth. It doesn't just "scrape reviews"; it audits product market-fit, identifies revenue leakage, and generates structured growth roadmaps for D2C founders.

---

## 🛠️ Technical Stack (The "Foundation")

### 1. Frontend & Core Framework
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + Framer Motion (Premium, high-performance UI)
- **State Management**: React Hooks (useState/useEffect) + URL SearchParams for deep-linking.
- **Reporting**: jsPDF (Professional, on-the-fly tactical audit generation).

### 2. The "Brain" (AI Layer)
- **Model**: **Google Gemini 3.1 Flash-Lite** (Custom-tuned for sub-3s reasoning latency and high JSON adherence).
- **Service**: `IntelligenceService.ts`
- **Core Logic**: Uses a "Ground Truth" approach. AI analysis is strictly anchored in actual numerical review distributions to prevent "hallucinated marketing speak."

### 3. The "Hands" (Data Acquisition)
- **Provider**: **Apify** (Multi-actor strategy).
- **Resilience Strategy**: 
  - **Stealth Mode**: Automated residential proxy rotation for Amazon/Walmart.
  - **Jitter Engine**: Human-randomized delays (4s–12s) to bypass bot detection.
  - **Fallback Logic**: Seamlessly switches between scraping sources if a specific platform (like Walmart) increases security.

### 4. The "Memory" (Persistence Layer)
- **Database**: **Supabase (PostgreSQL)**
- **Intelligent Caching**: Analyzed reports are cached for 72 hours. Repeated audits for the same URL consume zero AI/Scraper credits.

---

## 🌍 Global Globalization Engine

ReviewVetter is a "Global-First" SaaS. It automatically adapts its entire intelligence output and UI to the user's economic context:

- **Geo-Detection**: Uses a hybrid of `navigator.language` and `Intl` Timezone detection (e.g., `Asia/Kolkata` for India).
- **Dynamic Localization**:
  - Automatically swaps currency symbols (**₹, $, ر.с, ₽**).
  - Automatically formats numbers according to regional standards (`en-IN` vs `en-US`).
- **Currency-Aware Prompting**: The AI is instructed via the prompt context to generate **Roadmaps** and **Financial Recovery Estimates** using the user's specific local currency.

---

## 🚀 Key Functional Workflows

### 💻 Market Audit Flow
1. **Scout Phase**: The system identifies the platform (URL pattern matching).
2. **Harvest Phase**: Apify extractors pull reviews using residential proxies.
3. **Synthesis Phase**: Gemini 3.1 processes raw reviews, generating a JSON intelligence report.
4. **Localization Phase**: The report's financial data is scaled to the user's currency.

### ⚔️ Battlecard (Comparison) Flow
Allows users to compare two products side-by-side. The AI identifies specific "Market Vulnerabilities" where the user can steal market share from the competitor based on customer complaints about the rival product.

### 📈 ROI Leakage Calculator
Taking "Pro Scout" pricing ($27 as base), it calculates **lost revenue recovery** based on product quality issues found in reviews. 
- *Formula*: `Potential Recovery = Monthly Revenue * (AI-Identified Leakage %)`

---

## 🧪 Security & Resilience (The "Hardened" Layer)
- **Anti-Bot Stealth**: The system mimics human request headers, screen resolutions, and scrolling patterns.
- **Executive-Friendly Language**: All technical jargon (Scraping, JSON, Parsing) is abstracted into benefit-driven business terms (Signal Discovery, Insight Synthesis).
- **Graceful Failure**: If a platform blocks a request, the UI reports a "Security Scout Pause" rather than a technical 403 error.

---

## 📂 Core file-system Intelligence
- `/src/lib/services/intelligence.ts`: The AI logic and prompt engineering.
- `/src/lib/services/pdf.ts`: Executive report generation logic.
- `/src/lib/utils/currency.ts`: The globalization engine.
- `/src/app/api/analyze/route.ts`: The unified entry point for all audits.

---
*Authored by Antigravity for ReviewVetter Intelligence Inc.*
