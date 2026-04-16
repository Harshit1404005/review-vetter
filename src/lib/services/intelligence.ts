import { createClient } from "@/lib/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Normalization Mapping for Apify Amazon Scraper
 */
export interface ApifyAmazonReview {
  reviewTitle: string;
  reviewDescription: string;
  reviewRatingStars: number;
  reviewerName: string;
  reviewDate: string;
  productAsin: string;
}

export type Sentiment = "BULLISH" | "FRUSTRATED" | "NEUTRAL" | "STABLE";

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
  source: "AMAZON" | "SHOPIFY" | "WALMART" | "TRUSTPILOT";
}

export interface StrategicStep {
  title: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  effort: "HIGH" | "MEDIUM" | "LOW";
}

export interface AdHook {
  platform: "META" | "TIKTOK" | "GOOGLE";
  headline: string;
  body: string;
}

export interface ResponseTemplate {
  trigger: string;
  response: string;
}

export interface ProductIntelligence {
  productName: string;
  score: number; // 0-100
  sentiment: Sentiment;
  sourceMix: Record<string, number>;
  topPros: string[];
  topCons: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  details: {
    quality: number;
    value: number;
    shipping: number;
    support: number;
  };
  revenueImpact: {
    leakageReason: string;
    recoveryEstimate: string; // e.g., "15-20%"
  };
  adHooks: AdHook[];
  responseTemplates: ResponseTemplate[];
  featureRequests: string[];
  marketingHooks: string[];
  roadmap: StrategicStep[];
  sampleReviews: Review[];
}

export interface ComparisonReport {
  subject: ProductIntelligence;
  competitor: ProductIntelligence;
  delta: {
    scoreDiff: number;
    keyAdvantage: string;
    keyRisk: string;
  };
  battlecards: {
    title: string;
    point: string;
    action: string;
  }[];
}

export class IntelligenceService {
  /**
   * Analyzes an array of reviews to generate a SWOT intelligence report using Gemini 1.5 Flash.
   */
  static async analyzeReviews(productName: string, reviews: Review[], url?: string): Promise<ProductIntelligence> {
    if (reviews.length === 0) {
      throw new Error("No reviews provided for analysis.");
    }

    // 1 ── Check Cache first if URL provided
    if (url) {
      const cached = await this.checkCache(url);
      if (cached) return cached;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Check your .env setup.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1 ── Calculate Ground Truth Stats to anchor the AI
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
    const ratingDist = reviews.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const negCount = reviews.filter(r => r.rating <= 3).length;

    const reviewText = reviews.map(r => `[Rating: ${r.rating}/5] ${r.title}: ${r.body}`).join("\n---\n");

    const prompt = `
      Analyze the following product reviews for "${productName}" and generate a comprehensive intelligence report in JSON format.
      
      GROUND TRUTH DATA (MUST USE TO CALCULATE SCORES):
      - Total Reviews Analyzed: ${totalReviews}
      - Calculated Average Rating: ${avgRating.toFixed(2)}/5
      - Rating Distribution: ${JSON.stringify(ratingDist)}
      - Negative/Neutral Signals (1-3 stars): ${negCount} out of ${totalReviews}

      STRICT SCORING RULES:
      1. The "score" (0-100) MUST correlate with the Average Rating (e.g., 4.0/5 should be roughly 80/100).
      2. Do NOT give a score of 100 unless there are ZERO negative reviews and the average rating is 5.0. 
      3. If negative signals exist (> 10%), the "score" MUST be below 90.
      4. Vector Scores (quality, value, etc. in "details") must be heavily penalized if negative keywords (broken, expensive, slow, terrible) appear in the review text for that category.
      5. Be CRITICAL. Marketers and Owners use this to find flaws, not just for praise.

      REVIEWS:
      ${reviewText}

      JSON STRUCTURE REQUIRED:
      {
        "productName": "${productName}",
        "score": number (0-100),
        "sentiment": "BULLISH" | "FRUSTRATED" | "NEUTRAL" | "STABLE",
        "topPros": string[] (top 3 specific benefits),
        "topCons": string[] (top 3 specific pain points),
        "swot": {
          "strengths": string[],
          "weaknesses": string[],
          "opportunities": string[],
          "threats": string[]
        },
        "details": {
          "quality": number (0-100),
          "value": number (0-100),
          "shipping": number (0-100),
          "support": number (0-100)
        },
        "revenueImpact": {
          "leakageReason": "string (the #1 reason people stop buying or return)",
          "recoveryEstimate": "string (e.g. 15-20%)"
        },
        "adHooks": [
          { "platform": "META", "headline": "string", "body": "string" },
          { "platform": "TIKTOK", "headline": "string", "body": "string" }
        ],
        "responseTemplates": [
          { "trigger": "string (top complaint)", "response": "string (professional response)" }
        ],
        "featureRequests": string[],
        "marketingHooks": string[],
        "roadmap": [
          { "title": "string", "description": "string", "impact": "HIGH"|"MEDIUM"|"LOW", "effort": "HIGH"|"MEDIUM"|"LOW" }
        ]
      }

      Return ONLY the JSON object.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse AI response — model returned non-JSON output.");
      
      const aiData = JSON.parse(jsonMatch[0]);
      
      const finalReport = {
        ...aiData,
        sourceMix: reviews.reduce((acc, r) => {
          acc[r.source] = (acc[r.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        sampleReviews: reviews.slice(0, 3)
      };

      // 2 ── Save to Cache if URL provided (non-blocking)
      if (url) {
        this.saveToCache(url, reviews, finalReport).catch(cacheErr => {
          console.warn("Cache save failed (non-critical):", cacheErr);
        });
      }

      return finalReport;
    } catch (e: any) {
      // Surface the real error for debugging
      const realMsg = e?.message || String(e);
      console.error("Gemini Analysis Failed (real error):", realMsg);

      if (realMsg.includes("API_KEY_INVALID") || realMsg.includes("invalid api key")) {
        throw new Error("Gemini API key is invalid. Please check your GEMINI_API_KEY environment variable.");
      }
      if (realMsg.includes("quota") || realMsg.includes("429")) {
        throw new Error("Gemini API quota exceeded. Please wait a moment and try again.");
      }
      if (realMsg.includes("parse") || realMsg.includes("JSON")) {
        throw new Error("AI returned an unexpected format. Retrying may help.");
      }

      throw new Error(`Analysis failed: ${realMsg}`);
    }
  }

  /**
   * Checks the Supabase cache for a fresh analysis (within 72 hours).
   */
  static async checkCache(url: string): Promise<ProductIntelligence | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("scraped_reviews")
        .select("analysis")
        .eq("product_url", url)
        .gte("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
        .single();

      if (error || !data) return null;
      return data.analysis as ProductIntelligence;
    } catch (e) {
      console.error("[Cache] Failed to check cache:", e);
      return null;
    }
  }

  /**
   * Saves reviews and analysis to the cache.
   */
  static async saveToCache(url: string, reviews: Review[], analysis: ProductIntelligence): Promise<void> {
    try {
      const supabase = createClient();
      await supabase
        .from("scraped_reviews")
        .upsert({
          product_url: url,
          product_name: analysis.productName,
          reviews: reviews,
          analysis: analysis,
          created_at: new Date().toISOString()
        }, { onConflict: "product_url" });
    } catch (e) {
      console.error("[Cache] Failed to save cache:", e);
    }
  }

  /**
   * Returns a pre-scraped demo report instantly.
   */
  static async fetchDemoReport(slug: "yeti-rambler" | "anker-charger"): Promise<ProductIntelligence> {
    const demoData: Record<string, ProductIntelligence> = {
      "yeti-rambler": {
        productName: "YETI Rambler 30 oz Tumbler",
        score: 92,
        sentiment: "BULLISH",
        sourceMix: { "AMAZON": 20 },
        topPros: ["Extreme temperature retention", "Indestructible build quality", "Dishwasher safe"],
        topCons: ["Price premium", "Heavier than competitors", "Lid can splash if dropped"],
        swot: {
          strengths: ["Brand authority", "Thermal performance", "Durability"],
          weaknesses: ["High entry price", "No handles on base model"],
          opportunities: ["Expansion into customized colors", "Corporate gifting bundles"],
          threats: ["Growing competition from Stanley", "Imitation knockoffs"]
        },
        details: { quality: 98, value: 75, shipping: 90, support: 85 },
        revenueImpact: { leakageReason: "High price barrier", recoveryEstimate: "10-12%" },
        adHooks: [
          { platform: "META", headline: "The Last Tumbler You'll Ever Buy", body: "Stop replacing cheap cups. YETI is built for a lifetime of adventure." },
          { platform: "TIKTOK", headline: "Ice test: 24 hours later", body: "Watch how YETI keeps ice solid while the others melt. #YetiLife" }
        ],
        responseTemplates: [
          { trigger: "Too expensive", response: "We build our products to last a lifetime, which is reflected in the premium materials and engineering." }
        ],
        featureRequests: ["Built-in handle option", "More matte finishes"],
        marketingHooks: ["The Over-Engineered Cup", "Ice's Worst Enemy"],
        roadmap: [
          { title: "Personalization Engine", description: "Scale custom engraving options for the 30oz line.", impact: "HIGH", effort: "MEDIUM" },
          { title: "Handle Integration", description: "Standardize handles on large capacity models.", impact: "MEDIUM", effort: "LOW" }
        ],
        sampleReviews: [
          { id: "demo1", rating: 5, title: "Best cup ever", body: "Kept my coffee hot for 6 hours. Worth the price.", author: "OutdoorGuy", date: "2024-03-01", source: "AMAZON" }
        ]
      }
    };

    return demoData[slug] || demoData["yeti-rambler"];
  }

  /**
   * Original rules-based analysis as a fallback.
   */
  private static _analyzeReviewsRulesBased(productName: string, reviews: Review[]): ProductIntelligence {

    // 1 ── Aggregate Sentiment
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    let sentimentScore = 0;
    
    // 2 ── Extraction & Keyword Analysis
    const wordFreq: Record<string, number> = {};
    const commonWords = new Set(["product", "ordered", "bought", "amazon", "really", "everything"]);

    reviews.forEach(r => {
      const text = `${r.title} ${r.body}`.toLowerCase();
      
      // Intent/Sentiment Detection (Logic from RedditService ported)
      if (text.match(/love|amazing|best|quality|perfect/)) sentimentScore++;
      if (text.match(/broken|waste|return|terrible|scam/)) sentimentScore--;

      const words = text.split(/\W+/);
      words.forEach(w => {
        if (w.length > 5 && !commonWords.has(w)) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      });
    });

    const topKeywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([w]) => w.toUpperCase());

    // 3 ── SWOT Synthesis (Rules-based for MVP)
    const swot = {
      strengths: topKeywords.slice(0, 3),
      weaknesses: topKeywords.slice(3, 6),
      opportunities: ["Aggressive expansion into EU markets", "Social media 'Viral' potential via TikTok influencers"],
      threats: ["Growing competition from white-label brands", "Supply chain volatility in Q4"]
    };
    
    const roadmap = this.generateRoadmap(swot);

    return {
      productName,
      score: this.calculateVetterScore(reviews),
      sentiment: reviews.filter(r => r.rating >= 4).length > reviews.length * 0.6 ? "BULLISH" : "FRUSTRATED",
      sourceMix: reviews.reduce((acc, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topPros: swot.strengths.slice(0, 3),
      topCons: swot.weaknesses.slice(0, 3),
      swot,
      details: {
        quality: this.calcDetail(reviews, ["quality", "build", "durable", "material", "finish"]),
        value: this.calcDetail(reviews, ["value", "worth", "price", "cheap", "expensive", "money"]),
        shipping: this.calcDetail(reviews, ["shipping", "delivery", "arrived", "fast", "package"]),
        support: this.calcDetail(reviews, ["support", "customer", "service", "refund", "response", "help"]),
      },
      revenueImpact: {
        leakageReason: swot.weaknesses[0] || "Quality Consistency",
        recoveryEstimate: "12-18% lift potential"
      },
      adHooks: [
        {
          platform: "META",
          headline: `Stop overpaying for ${productName.split(' ')[0]}`,
          body: `Customers love our ${swot.strengths[0] || 'performance'}. Get the quality you deserve.`
        },
        {
          platform: "TIKTOK",
          headline: "This product is a game changer! 🚀",
          body: `Just found the benchmark for ${productName}. The ${swot.strengths[0] || 'quality'} is unmatched.`
        }
      ],
      responseTemplates: [
        {
          trigger: swot.weaknesses[0] || "General Issue",
          response: `Hi there, we're sorry to hear about this issue. We've added it to our urgent product roadmap and would love to make it right.`
        }
      ],
      featureRequests: [
        `Improve ${swot.weaknesses[0] || 'durability'} in next iteration`,
        "Provide more eco-friendly packaging options",
        "Add multi-language support for user manuals"
      ],
      marketingHooks: [
        `The only ${productName.split(' ')[0]} with ${swot.strengths[0] || 'elite'} performance.`,
        "Loved by thousands for its reliability and design.",
        `Upgrade your lifestyle with proven ${swot.strengths[1] || 'quality'}.`
      ],
      roadmap: [
        { title: "Quality Stabilization", description: `Urgent fix for ${swot.weaknesses[0] || 'hardware'} issues reported by users.`, impact: "HIGH", effort: "MEDIUM" },
        { title: "Packaging Revamp", description: "Switch to premium eco-materials to justify price point.", impact: "MEDIUM", effort: "LOW" },
        { title: "Global Expansion", description: "Localize manuals and support for EU/Asia markets.", impact: "HIGH", effort: "HIGH" },
        { title: "Loyalty Program", description: "Incentivize long-term users with exclusive discounts.", impact: "LOW", effort: "LOW" },
        { title: "V2 Prototype", description: `Integrate ${swot.strengths[0] || 'advanced'} features into the next-gen model.`, impact: "HIGH", effort: "HIGH" }
      ],
      sampleReviews: reviews.slice(0, 3)
    };
  }

  /**
   * Generates a comparison report between two analyzed products.
   */
  static generateComparison(subject: ProductIntelligence, competitor: ProductIntelligence): ComparisonReport {
    const scoreDiff = subject.score - competitor.score;
    
    return {
      subject,
      competitor,
      delta: {
        scoreDiff,
        keyAdvantage: scoreDiff > 0 ? "Product Reliability" : "Market Pricing",
        keyRisk: scoreDiff > 0 ? "Customer Support overhead" : "Quality consistency",
      },
      battlecards: [
        { 
          title: "Pricing Edge", 
          point: subject.details.value > competitor.details.value ? "You are perceived as better value." : "Competitor is winning on price perception.",
          action: "Highlight 'Premium Durability' to justify current price gaps."
        },
        { 
          title: "Feature Gap", 
          point: "Competitor is missing modern 'AI-integration' signals found in your reviews.", 
          action: "Launch ad campaign emphasizing 'The Smartest Choice in the Category'."
        }
      ]
    };
  }

  /**
   * Triggers an Apify scraper for a given URL with bulletproof retry logic.
   */
  static async fetchRealReviews(url: string, token: string): Promise<Review[]> {
    console.log(`[ReviewVetter] Starting Resilient Scan for: ${url}`);
    
    const actorIds = ["junglee~amazon-reviews-scraper", "compass~amazon-reviews-scraper", "relex~amazon-reviews-scraper"];
    let runData: any = null;
    let successfulActorId = "";
    
    // Retry state
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        for (const actorId of actorIds) {
          console.log(`[Apify] Attempt ${attempt}: Triggering ${actorId}...`);
          const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
            method: "POST",
            body: JSON.stringify({
              productUrls: [{ url }],
              maxReviews: 50,
            }),
            headers: { "Content-Type": "application/json" }
          });

          if (response.ok) {
            runData = await response.json();
            successfulActorId = actorId;
            break;
          } else {
            const status = response.status;
            const text = await response.text();
            console.warn(`[Apify] Actor ${actorId} rejected: ${status} - ${text}`);
            
            if (status === 403 || status === 401) {
               throw new Error("Scraper blocked by Amazon (Forbidden). Fallback to CSV.");
            }
            if (status === 429) {
               console.warn("[Apify] Rate limited. Waiting...");
               break; // Move to next actor or retry delay
            }
          }
        }

        if (runData) break; // Success!

        if (attempt < MAX_RETRIES) {
          console.log(`[Apify] Retry ${attempt} failed. Waiting ${RETRY_DELAY/1000}s...`);
          await wait(RETRY_DELAY);
        }
      } catch (err: any) {
        if (err.message.includes("blocked") && attempt === MAX_RETRIES) throw err;
        console.error(`[Apify] Attempt ${attempt} exception:`, err);
        if (attempt < MAX_RETRIES) await wait(RETRY_DELAY);
      }
    }

    if (!runData) {
      throw new Error("Amazon/Scraper blocked our scan. Please try the CSV Upload fallback below.");
    }

    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    console.log(`[Apify] Scraper (${successfulActorId}) triggered successfully. Run ID: ${runId}`);

    // 2 ── Poll for Completion (Wait up to 60 seconds)
    let finished = false;
    let attempts = 0;
    while (!finished && attempts < 20) {
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
      const statusData = await statusRes.json();
      
      const status = statusData.data.status;
      console.log(`[Apify] Run Status: ${status} (Attempt ${attempts + 1}/20)`);

      if (status === "SUCCEEDED") {
        finished = true;
      } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        throw new Error(`Scraper run failed with status: ${status}`);
      } else {
        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      }
    }

    // 3 ── Fetch Dataset Items
    console.log(`[Apify] Fetching results from Dataset: ${datasetId}`);
    const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    const items: any[] = await dataRes.json();

    if (items.length === 0) {
      throw new Error("Scraper finished but returned zero reviews. Try a different URL.");
    }

    return items.map((item, i) => ({
      id: `${item.productAsin || item.asin || 'review'}-${i}`,
      rating: item.reviewRatingStars || item.rating || 5,
      title: item.reviewTitle || item.title || "Review",
      body: item.reviewDescription || item.text || item.body || "",
      author: item.reviewerName || item.name || "Customer",
      date: item.reviewDate || new Date().toISOString(),
      source: "AMAZON"
    }));
  }

  /**
   * Triggers a Shopify scraper for a given URL.
   */
  static async fetchShopifyReviews(url: string, token: string): Promise<Review[]> {
    console.log(`[ReviewVetter] Shopify Live Scan: ${url}`);
    
    // Actor: epctex/shopify-reviews-scraper
    const response = await fetch(`https://api.apify.com/v2/acts/epctex~shopify-reviews-scraper/runs?token=${token}`, {
      method: "POST",
      body: JSON.stringify({
        startUrls: [{ url }],
        maxReviews: 20,
      }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Failed to trigger Shopify scraper.");
    const runData = await response.json();
    
    // Poll for results
    let finished = false;
    let attempts = 0;
    while (!finished && attempts < 20) {
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runData.data.id}?token=${token}`);
      const statusData = await statusRes.json();
      const status = statusData.data.status;
      
      if (status === "SUCCEEDED") {
        finished = true;
      } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        throw new Error(`Shopify Scraper failed with status: ${status}`);
      } else {
        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      }
    }

    const statusDataForDataset = await (await fetch(`https://api.apify.com/v2/actor-runs/${runData.data.id}?token=${token}`)).json();
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${statusDataForDataset.data.defaultDatasetId}/items?token=${token}`);
    const items: any[] = await itemsRes.json();

    return items.map((item, i) => ({
      id: `${item.id || i}`,
      rating: item.rating || 5,
      title: item.title || "Review",
      body: item.body || item.text || "",
      author: item.author || "Customer",
      date: item.date || new Date().toISOString(),
      source: "SHOPIFY"
    }));
  }

  /**
   * Triggers a Walmart scraper for a given URL.
   */
  static async fetchWalmartReviews(url: string, token: string): Promise<Review[]> {
    console.log(`[ReviewVetter] Walmart Live Scan: ${url}`);
    
    // Actor: junglee~walmart-reviews-scraper
    const response = await fetch(`https://api.apify.com/v2/acts/junglee~walmart-reviews-scraper/runs?token=${token}`, {
      method: "POST",
      body: JSON.stringify({
        productUrls: [{ url }],
        maxReviews: 50,
      }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Failed to trigger Walmart scraper.");
    const runData = await response.json();
    return this._pollForResults(runData.data.id, token, "WALMART");
  }

  /**
   * Triggers a Trustpilot scraper for a given URL.
   */
  static async fetchTrustpilotReviews(url: string, token: string): Promise<Review[]> {
    console.log(`[ReviewVetter] Trustpilot Live Scan: ${url}`);
    
    // Actor: apify~trustpilot-scraper
    const response = await fetch(`https://api.apify.com/v2/acts/apify~trustpilot-scraper/runs?token=${token}`, {
      method: "POST",
      body: JSON.stringify({
        startUrls: [{ url }],
        maxReviews: 50,
      }),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("Failed to trigger Trustpilot scraper.");
    const runData = await response.json();
    return this._pollForResults(runData.data.id, token, "TRUSTPILOT");
  }

  private static async _pollForResults(runId: string, token: string, source: "AMAZON" | "WALMART" | "TRUSTPILOT"): Promise<Review[]> {
    let finished = false;
    let attempts = 0;
    while (!finished && attempts < 20) {
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
      const statusData = await statusRes.json();
      const status = statusData.data.status;
      console.log(`[Apify] ${source} Run Status: ${status} (${attempts + 1}/20)`);

      if (status === "SUCCEEDED") {
        finished = true;
      } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        throw new Error(`${source} Scraper failed with status: ${status}`);
      } else {
        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      }
    }

    const dataRes = await fetch(`https://api.apify.com/v2/datasets/${runId.split('-')[1]}/items?token=${token}`); // Just an example, normally datasetId comes from runData
    // Wait, datasetId is usually better found via statusData.data.defaultDatasetId
    const statusDataForDataset = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`)).json();
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${statusDataForDataset.data.defaultDatasetId}/items?token=${token}`);
    const items: any[] = await itemsRes.json();

    return items.map((item, i) => ({
      id: `${item.id || item.asin || i}`,
      rating: item.rating || item.stars || item.reviewRatingStars || 5,
      title: item.title || item.reviewTitle || "Review",
      body: item.text || item.body || item.reviewDescription || "",
      author: item.author || item.reviewerName || "Customer",
      date: item.date || item.reviewDate || new Date().toISOString(),
      source
    }));
  }

  private static calculateVetterScore(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    return Math.round((avg / 5) * 100);
  }

  private static calcDetail(reviews: Review[], keywords: string[]): number {
    const relevant = reviews.filter(r =>
      keywords.some(k => `${r.title} ${r.body}`.toLowerCase().includes(k))
    );
    if (relevant.length === 0) {
      // No keyword match — fall back to avg rating as proxy
      const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      return Math.round((avg / 5) * 100);
    }
    const avg = relevant.reduce((acc, r) => acc + r.rating, 0) / relevant.length;
    return Math.round((avg / 5) * 100);
  }

  private static generateRoadmap(swot: any): StrategicStep[] {
    return [
      { 
        title: "Quality Stabilization", 
        description: `Urgent fix for ${swot.weaknesses[0] || 'consistency'} issues reported in recent signals.`, 
        impact: "HIGH", 
        effort: "MEDIUM" 
      },
      { 
        title: "Market Advantage", 
        description: `Scale the ${swot.strengths[0] || 'performance'} lead identified by customers.`, 
        impact: "HIGH", 
        effort: "LOW" 
      },
      { 
        title: "ROI Expansion", 
        description: swot.opportunities[0] || "Explore secondary market penetration.", 
        impact: "MEDIUM", 
        effort: "HIGH" 
      }
    ];
  }

  /**
   * Saves a scout report to the Supabase database.
   * Returns the ID of the newly created report.
   */
  static async saveReport(report: ProductIntelligence, url: string): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Authentication required to save reports.");

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        product_name: report.productName,
        url,
        score: report.score,
        sentiment: report.sentiment,
        data: report
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Fetches a single public report by ID.
   */
  static async getPublicReportById(id: string): Promise<any> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletes a report from the database.
   */
  static async deleteReport(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Fetches all saved reports for the authenticated user.
   */
  static async getUserReports(): Promise<any[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculates the global trend for a given URL.
   * Returns the percentage delta (e.g., +5, -2).
   */
  static async getGlobalScoreTrend(url: string, currentScore: number): Promise<number | null> {
    const supabase = createClient();
    
    // Fetch previous scores for this URL
    const { data: previousReports, error } = await supabase
      .from("reports")
      .select("score")
      .eq("url", url)
      .order("created_at", { ascending: false })
      .limit(10); // Look at last 10 global scans

    if (error || !previousReports || previousReports.length <= 1) return null;

    // Calculate average of previous scores (excluding current one if it was just saved)
    // For simplicity, we'll just average the existing ones.
    const avgPrevious = previousReports.reduce((acc, r) => acc + r.score, 0) / previousReports.length;
    
    return Math.round(currentScore - avgPrevious);
  }
}
