-- QUOTA SYSTEM MIGRATION
-- This script sets up a profiles table to track user tiers and daily scraping quotas.

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  tier TEXT DEFAULT 'free', -- 'free', 'pro', 'business'
  scrapes_today INTEGER DEFAULT 0,
  last_scrape_date DATE DEFAULT CURRENT_DATE,
  is_admin BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 4. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. RPC to check and increment quota atomically
-- Returns: { allowed: boolean, remaining: integer, error: string }
CREATE OR REPLACE FUNCTION check_and_increment_quota(user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_tier TEXT;
  v_scrapes INTEGER;
  v_last_date DATE;
  v_limit INTEGER;
  v_profile public.profiles%ROWTYPE;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = user_id;
  
  -- Handle missing profile (safety)
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id) VALUES (user_id) RETURNING * INTO v_profile;
  END IF;

  v_tier := v_profile.tier;
  v_scrapes := v_profile.scrapes_today;
  v_last_date := v_profile.last_scrape_date;

  -- Reset if new day (UTC)
  IF v_last_date < CURRENT_DATE THEN
    v_scrapes := 0;
    v_last_date := CURRENT_DATE;
  END IF;

  -- Determine limit based on tier
  CASE v_tier
    WHEN 'pro' THEN v_limit := 50;
    WHEN 'business' THEN v_limit := 9999; -- Unlimited-ish
    ELSE v_limit := 3; -- Free tier
  END CASE;

  -- Check Quota
  IF v_scrapes >= v_limit THEN
    RETURN json_build_object(
      'allowed', false,
      'remaining', 0,
      'error', 'Daily quota reached (' || v_limit || '). Upgrade to Pro for more.'
    );
  END IF;

  -- Update Count
  UPDATE public.profiles 
  SET 
    scrapes_today = v_scrapes + 1,
    last_scrape_date = v_last_date,
    updated_at = now()
  WHERE id = user_id;

  RETURN json_build_object(
    'allowed', true,
    'remaining', v_limit - (v_scrapes + 1),
    'error', NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
