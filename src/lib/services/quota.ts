import { createClient } from "@/lib/supabase/server";

export interface QuotaStatus {
  allowed: boolean;
  remaining: number;
  error: string | null;
}

export class QuotaService {
  /**
   * Checks if the current authenticated user has remaining credits to perform a scan.
   * Logic is encapsulated in a Supabase RPC for atomicity and security.
   */
  static async checkAndIncrement(): Promise<QuotaStatus> {
    const supabase = await createClient();
    
    // 1. Get current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return { 
        allowed: false, 
        remaining: 0, 
        error: "Authentication required to perform analysis." 
      };
    }

    const userId = session.user.id;

    // 2. Call the Database RPC
    const { data, error: rpcError } = await supabase.rpc('check_and_increment_quota', {
      user_id: userId
    });

    if (rpcError) {
      console.error("[QuotaService] RPC Error:", rpcError);
      return { 
        allowed: false, 
        remaining: 0, 
        error: "Quota service unavailable. Please try again later." 
      };
    }

    // RPC returns JSON object as defined in SQL
    return data as QuotaStatus;
  }

  /**
   * Utility to check if a user is Pro
   */
  static async isProUser(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', session.user.id)
      .single();

    return profile?.tier === 'pro' || profile?.tier === 'business';
  }
}
