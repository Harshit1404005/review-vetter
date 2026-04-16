import { NextResponse } from "next/server";
import { IntelligenceService } from "@/lib/services/intelligence";

export const runtime = "edge";

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

    // Direct Synthesis
    const intel = await IntelligenceService.analyzeReviews(productName, reviews, "Manual Upload (CSV)");
    
    return NextResponse.json({ type: "SINGLE", ...intel });

  } catch (error: any) {
    console.error("Raw Analysis API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
