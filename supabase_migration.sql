-- 🛡️ REVIEWVETTER: Scrape Caching Migration
-- Run this in your Supabase SQL Editor to activate the 72-hour cache.

CREATE TABLE IF NOT EXISTS public.scraped_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_url TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    reviews JSONB NOT NULL,
    analysis JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scraped_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (since our app uses the Anon key and handles validation)
-- In a strict prod environment, you would restrict this to authenticated service roles.
CREATE POLICY "Allow public read-write for scans" 
ON public.scraped_reviews 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Index for fast URL lookups
CREATE INDEX IF NOT EXISTS idx_scraped_reviews_url ON public.scraped_reviews (product_url);
