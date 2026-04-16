import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

/**
 * CRON ROUTE: Resets the dailyScrapes counter in the database.
 * Security: Requires 'CRON_SECRET' header.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("x-cron-secret");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // Reset all users whose last_scrape_date is before today
    const { error } = await supabase
      .from("profiles")
      .update({ scrapes_today: 0, last_scrape_date: new Date().toISOString().split("T")[0] })
      .lt("last_scrape_date", new Date().toISOString().split("T")[0]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Quotas reset for new day." });
  } catch (error: any) {
    console.error("[Cron] Quota Reset Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
