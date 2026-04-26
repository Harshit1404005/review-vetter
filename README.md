# ReviewVetter 🛡️ | E-commerce Intelligence Suite

**ReviewVetter** is a high-performance, AI-driven intelligence platform designed for e-commerce owners, marketers, and product managers. It transforms raw, fragmented customer reviews from **Amazon, Shopify, Walmart, and Trustpilot** into actionable strategic assets.

Built for the "Growth Era," ReviewVetter uses **Gemini 3.1 Flash-Lite** to provide deep psychological insights and ROI-based math that standard analytics tools miss with extreme cost-efficiency. Our **Global Localization Engine** automatically adapts pricing and revenue analysis to the user's local currency.

> [!TIP]
> For a deep-dive into the AI architecture, scraping engine, and globalization logic, see [SYSTEM_OVERVIEW.md](file:///d:/Anikiyo/reddit_profile_viewer/review_vetter/SYSTEM_OVERVIEW.md).

---

## 🚀 Core Functionalities

### 1. Deep AI Intelligence Engine (The "Vetter Score")
- **Psychological Synthesis**: Moves beyond simple keyword tags to understand the *why* behind customer sentiment.
- **Ground Truth Scoring**: The **Vetter Score (0-100)** is anchored in real numerical data (average star ratings and distribution) to prevent AI hallucination.
- **SWOT Audit Matrices**: Instantly generates Strengths, Weaknesses, Opportunities, and Threats for any product link.

### 2. ROI-Based Marketing & Profit Tools
- **Revenue Leakage Calculator**: Identifies specific product flaws causing returns or lost sales.
- **Interactive ROI Math**: Visualizes potential MRR recovery with a custom revenue-based calculator on the dashboard and landing page.
- **Ad Creative Studio**: Extracts high-converting ad hooks for **Meta** and **TikTok** directly from qualitative customer evidence.
- **Smart Reply Drafts**: AI-drafted responses to top customer triggers, optimized for engagement and resolution.

### 3. Multi-Source Scraping Agents
- **Autonomous Crawlers**: Integrated with Apify agents to pull fresh review data from:
  - **Amazon** (Global support)
  - **Shopify** (Direct products and store links)
  - **Walmart**
  - **Trustpilot** (Brand reputation level)

### 4. Market Advantage & Intelligence Board
- **Side-by-Side Comparison**: Compare your product against any competitor to find where to "steal" market share.
- **Intelligence Board (Workspace)**: A persistent dashboard to save, manage, and track strategic audits over time.
- **Battlecards**: Specific tactical action points on where you win and where you are vulnerable.

### 5. Professional Reporting
- **Strategic Evolution Roadmaps**: A 5-step growth plan with Impact vs. Effort ratings.
- **PDF Export**: Generate professional, brand-locked strategic audit reports for stakeholders or clients instantly.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router / Turbopack)
- **AI Brain**: Google Gemini 3.1 Flash-Lite (Optimized for speed/cost)
- **Localization**: Intelligent Geo-Currency Engine (₹ INR, $ USD, ر.س SAR, ₽ RUB)
- **Infrastructure**: Cloudflare Pages (Edge Runtime)
- **Deployment Adapter**: OpenNext for Cloudflare
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS 4 + Framer Motion (Premium Design System)
- **Reporting**: jsPDF

---

## ⚙️ Setup & Deployment

### 1. Local Development
1. **Clone & Install**: `npm install`
2. **Environment Variables**: Create `.env.local` with your Gemini, Apify, and Supabase keys.
3. **Run Dev**: `npm run dev`

### 2. Supabase Migration
You MUST run the `supabase_migration.sql` script in your Supabase SQL Editor. This initializes the `scraped_reviews` table required for the caching layer.

### 3. Cloudflare Deployment
ReviewVetter is optimized for the Cloudflare Edge runtime using **OpenNext**.
1. **Build**: `npm run build:cf`
2. **Deploy**: `npm run deploy` (requires Wrangler CLI)
*Alternatively, connect your repository to Cloudflare Pages and set the build command to `npm run build:cf` with the output directory to `.open-next`.*

---

## 💡 Cost Optimization & Scale
ReviewVetter is architected for zero-burn scalability:
- **72-Hour Intelligent Caching**: All product analyses are cached in Supabase. Repeat queries for the same product consume **zero** API credits.
- **Live Demo Mode**: High-fidelity pre-scraped reports (e.g., YETI Tumbler) allow users to experience the tool without triggering API costs.
- **Edge Native**: Runs entirely on Cloudflare Workers/Pages for global speed and minimal hosting cost.

---

## 🛡️ Data Privacy
- **Public Data Only**: ReviewVetter strictly analyzes publicly available review data.
- **GDPR Compliant**: No PII (Personally Identifiable Information) of consumers is stored. Only data-driven intelligence is saved in our database.

---

*Built for Growth Founders by ReviewVetter Intelligence Inc.*
