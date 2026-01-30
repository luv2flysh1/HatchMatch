-- Add failure tracking to fly shop sources for automatic cleanup
ALTER TABLE public.fly_shop_sources
ADD COLUMN IF NOT EXISTS consecutive_failures integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.fly_shop_sources.consecutive_failures IS 'Number of consecutive failed scrape attempts. Shop deactivated after 3 failures.';
