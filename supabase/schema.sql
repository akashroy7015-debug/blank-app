-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own usage" ON public.usage
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Credits system (pay as you go)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;

-- Server-side free tier tracking (prevents localStorage/cache reset abuse)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS free_analyses_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS free_analyses_date DATE;

-- plan and billing period (populated by Paddle webhook)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Atomic credit increment used by Paddle webhook to avoid read-then-write race conditions
-- Run this in your Supabase SQL editor AFTER the table is created
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, credits, status)
  VALUES (p_user_id, p_amount, 'inactive')
  ON CONFLICT (user_id)
  DO UPDATE SET credits = public.subscriptions.credits + EXCLUDED.credits;
END;
$$;
