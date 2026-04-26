import { NextResponse } from "next/server";
import { IntelligenceService } from "@/lib/services/intelligence";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { url, competitorUrl, isComparison, isDemo, currencySymbol } = await req.json();
    const token = process.env.APIFY_TOKEN;

    // 0 ── Handle Demo Mode
    if (isDemo) {
      const demoIntel = await IntelligenceService.fetchDemoReport("yeti-rambler");
      return NextResponse.json({ type: "SINGLE", ...demoIntel });
    }

    if (!url) {
      return NextResponse.json({ error: "Product URL is required" }, { status: 400 });
    }

    if (isComparison && !competitorUrl) {
      return NextResponse.json({ error: "Competitor URL is required for comparison mode" }, { status: 400 });
    }

    // 1 ── QUOTA CHECK: (Only for live sessions, Demo is free)
    let user: any = null;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const userData = await supabase.auth.getUser();
      user = userData.data.user;

      if (user) {
        const quota = await IntelligenceService.checkQuota(user.id);
        const required = isComparison ? 2 : 1;
        
        if (!quota.allowed || quota.remaining < required) {
          return NextResponse.json({ 
            error: `Insufficient reports remaining (${quota.remaining}). Upgrade to Pro for unlimited research.` 
          }, { status: 402 });
        }
      }
    } catch (e) {
      console.warn("Quota check bypassed:", e);
    }

    const analyzeUrl = async (targetUrl: string) => {
      const isAmazon = targetUrl.toLowerCase().includes("amazon.");
      const isWalmart = targetUrl.toLowerCase().includes("walmart.");
      const isTrustpilot = targetUrl.toLowerCase().includes("trustpilot.");
      const isShopify = targetUrl.toLowerCase().includes("myshopify.com") || targetUrl.toLowerCase().includes("/products/"); 
    
      // 1 ── CRITICAL: Check Cache First BEFORE triggering expensive Apify
      const cached = await IntelligenceService.checkCache(targetUrl);
      if (cached) return cached;

      if (token) {
        try {
          let reviews: any[] = [];
          let pName = "Product Scan";

          if (isAmazon) {
            reviews = await IntelligenceService.fetchRealReviews(targetUrl, token);
            pName = targetUrl.split("/dp/")[0]?.split("/").pop()?.replace(/-/g, " ") || "Amazon Product";
          } else if (isWalmart) {
            reviews = await IntelligenceService.fetchWalmartReviews(targetUrl, token);
            pName = "Walmart Product";
          } else if (isTrustpilot) {
            reviews = await IntelligenceService.fetchTrustpilotReviews(targetUrl, token);
            pName = targetUrl.split("/review/")[1]?.split("/")[0] || "Trustpilot Brand";
          } else if (isShopify) {
            reviews = await IntelligenceService.fetchShopifyReviews(targetUrl, token);
            pName = targetUrl.split("/products/")[1]?.split("/")[0]?.replace(/-/g, " ") || "Shopify Product";
          }

          if (reviews.length > 0) {
            const report = await IntelligenceService.analyzeReviews(pName, reviews, targetUrl, currencySymbol);
            if (user) await IntelligenceService.trackUsage(user.id);
            return report;
          }
        } catch (e: any) {
          console.error(`Analysis failed for ${targetUrl}:`, e);
          const msg = e.message || "";
          if (msg.includes("blocked") || msg.includes("forbidden") || msg.includes("timeout")) {
             throw new Error("Modern security protocols paused our live scout. Use a different link or upload a CSV below for instant analysis.");
          }
          throw e;
        }
      }

      throw new Error("Analysis failed. No data retrieved.");
    };

    if (isComparison) {
      const [subject, competitor] = await Promise.all([
        analyzeUrl(url),
        analyzeUrl(competitorUrl)
      ]);

      const comparison = IntelligenceService.generateComparison(subject, competitor);
      return NextResponse.json({ type: "COMPARISON", ...comparison });
    }

    const intel = await analyzeUrl(url);
    return NextResponse.json({ type: "SINGLE", ...intel });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
