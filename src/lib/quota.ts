import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";

export interface QuotaStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  error: string | null;
}

/**
 * QuotaManager handles usage enforcement for the ReviewVetter platform.
 * It uses Upstash Redis for high-speed edge checks with a reliable Supabase fallback.
 */
export class QuotaManager {
  private static redis: Redis | null = null;

  private static getRedis() {
    if (this.redis) return this.redis;
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      this.redis = new Redis({ url, token });
      return this.redis;
    }
    return null;
  }

  /**
   * Checks and increments the usage quota for a user.
   * Resets automatically at 00:00 IST (Indian Standard Time).
   */
  static async checkAndIncrement(userId: string): Promise<QuotaStatus> {
    const supabase = await createClient();
    const redis = this.getRedis();

    // 1. Get User Tier from Supabase (Source of Truth)
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", userId)
      .single();

    const tier = profile?.tier || "free";
    const limits: Record<string, number> = {
      free: 3,
      pro: 50,
      business: 9999,
    };
    const limit = limits[tier] || 3;

    if (tier === "business") {
      return { allowed: true, remaining: 9999, limit: 9999, error: null };
    }

    // 2. High-Speed Check (Redis)
    if (redis) {
      try {
        const key = `quota:${userId}:${this.getISTDateCode()}`;
        const count = await redis.incr(key);
        
        // If it's a new key, set expiry to 36 hours (safety buffer)
        if (count === 1) {
          await redis.expire(key, 36 * 3600);
        }

        if (count > limit) {
          return { 
            allowed: false, 
            remaining: 0, 
            limit, 
            error: `Daily limit reached (${limit}). Upgrade for more scans.` 
          };
        }

        return { allowed: true, remaining: limit - count, limit, error: null };
      } catch (err) {
        console.error("[QuotaManager] Redis failed, falling back to Supabase:", err);
      }
    }

    // 3. Reliable Fallback (Supabase RPC)
    // We already have 'check_and_increment_quota' RPC from previous migration
    const { data, error } = await supabase.rpc("check_and_increment_quota", {
      user_id: userId
    });

    if (error) {
      console.error("[QuotaManager] Supabase Fallback Error:", error);
      return { allowed: true, remaining: 1, limit: 3, error: null }; // Fail open for UX
    }

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      limit: limit,
      error: data.error
    };
  }

  /**
   * Generates a date code based on IST (UTC+5:30)
   */
  private static getISTDateCode(): string {
    const now = new Date();
    // Offset for IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().split("T")[0];
  }
}
