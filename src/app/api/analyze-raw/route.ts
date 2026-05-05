import { NextResponse } from "next/server";
import { IntelligenceService } from "@/lib/services/intelligence";

/**
 * API for Direct Analysis (CSV / Manual Data)
 * Skips scraping and goes straight to Gemini Synthesis.
 */
export async function POST(req: Request) {
  try {
    const { reviews, productName } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: "Review data is required" }, { status: 400 });
    }

    if (!productName) {
      return NextResponse.json({ error: "Product name is required for synthesis" }, { status: 400 });
    }

    let user: any = null;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const userData = await supabase.auth.getUser();
      user = userData.data.user;

      if (!user) {
        return NextResponse.json({ 
          error: "Please create a free account to run live product analyses." 
        }, { status: 401 });
      }

      if (user) {
        const { QuotaManager } = await import("@/lib/quota");
        const quota = await QuotaManager.consumeQuota(user.id);
        if (!quota.allowed) {
          return NextResponse.json({ 
            error: `Insufficient reports remaining (${quota.remaining}). Upgrade to Pro for unlimited research.` 
          }, { status: 402 });
        }
      }
    } catch (e) {
      console.warn("Quota check bypassed:", e);
    }

    // Direct Synthesis
    const intel = await IntelligenceService.analyzeReviews(productName, reviews, "Manual Upload (CSV)");
    
    return NextResponse.json({ type: "SINGLE", ...intel });

  } catch (error: any) {
    try {
      if (req.headers.get("user") || error.message) { 
          // Attempt to refund if user was loaded, we'll extract user ID safely if we can
          const { createClient } = await import("@/lib/supabase/server");
          const supabase = await createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
             const { QuotaManager } = await import("@/lib/quota");
             await QuotaManager.refundQuota(data.user.id);
          }
      }
    } catch(e) {}
    console.error("Raw Analysis API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
