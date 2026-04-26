import { createClient } from '../src/lib/supabase/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log("Checking Supabase Connectivity...");
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("✓ Auth Endpoint Accessible (User:", user ? user.email : "Not Logged In", ")");
    
    // Test fetch from reports table (even if empty)
    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .limit(1);
      
    if (error) {
       console.error("❌ Database Fetch Failed:", error);
    } else {
       console.log("✓ Database Records Accessible!");
    }
  } catch (err) {
    console.error("❌ Connection Failed:", err);
  }
}

test();
