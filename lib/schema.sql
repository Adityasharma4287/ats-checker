-- ATS Checker — Supabase SQL Schema
-- Supabase dashboard mein SQL Editor mein yeh poora paste karke run karein

-- 1. Profiles table (auth.users se linked)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'unlimited')),
  checks_used_this_month INTEGER DEFAULT 0,
  checks_reset_date DATE DEFAULT CURRENT_DATE,
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Analyses table (har check ka record)
CREATE TABLE public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  ats_score INTEGER NOT NULL,
  score_breakdown JSONB,
  keywords_found TEXT[],
  keywords_missing TEXT[],
  suggestions JSONB,
  overall_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  razorpay_subscription_id TEXT UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Monthly reset function
CREATE OR REPLACE FUNCTION public.reset_monthly_checks()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET checks_used_this_month = 0,
      checks_reset_date = CURRENT_DATE
  WHERE checks_reset_date < date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS (Row Level Security) — har user sirf apna data dekhe
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role bypass (for API routes)
CREATE POLICY "Service role full access profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access analyses" ON public.analyses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');
