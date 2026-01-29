-- HatchMatch Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE water_body_type AS ENUM ('river', 'lake', 'stream', 'creek', 'pond');
CREATE TYPE fly_type AS ENUM ('dry', 'nymph', 'streamer', 'wet', 'emerger');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE user_tier AS ENUM ('free', 'premium');
CREATE TYPE subscription_tier AS ENUM ('premium', 'season_pass');
CREATE TYPE insect_type AS ENUM ('mayfly', 'caddis', 'stonefly', 'midge', 'terrestrial');

-- ============================================
-- TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  home_latitude DECIMAL(10, 7),
  home_longitude DECIMAL(10, 7),
  skill_level skill_level DEFAULT 'beginner',
  tier user_tier DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Bodies
CREATE TABLE public.water_bodies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  type water_body_type NOT NULL,
  state VARCHAR(2) NOT NULL,
  city VARCHAR(100),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  species TEXT[] DEFAULT '{}',
  usgs_site_id VARCHAR(20),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flies
CREATE TABLE public.flies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type fly_type NOT NULL,
  sizes VARCHAR(20),
  image_url VARCHAR(500),
  description TEXT,
  species_targets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  auto_refresh BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Waters (junction table)
CREATE TABLE public.trip_waters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  water_body_id UUID NOT NULL REFERENCES public.water_bodies(id) ON DELETE CASCADE,
  "order" INT DEFAULT 0,
  UNIQUE(trip_id, water_body_id)
);

-- Catch Reports
CREATE TABLE public.catch_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  water_body_id UUID NOT NULL REFERENCES public.water_bodies(id) ON DELETE CASCADE,
  fly_id UUID NOT NULL REFERENCES public.flies(id) ON DELETE CASCADE,
  caught_at TIMESTAMPTZ NOT NULL,
  effectiveness INT CHECK (effectiveness >= 1 AND effectiveness <= 5),
  conditions JSONB,
  photo_url VARCHAR(500),
  is_public BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  water_body_id UUID NOT NULL REFERENCES public.water_bodies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, water_body_id)
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fly Shops
CREATE TABLE public.fly_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  address VARCHAR(300),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(500),
  hours JSONB,
  google_place_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hatch Charts
CREATE TABLE public.hatch_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region VARCHAR(100) NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  insect_name VARCHAR(100) NOT NULL,
  insect_type insect_type NOT NULL,
  fly_patterns TEXT[] DEFAULT '{}',
  time_of_day VARCHAR(50),
  water_types TEXT[] DEFAULT '{}'
);

-- Recommendation Cache
CREATE TABLE public.recommendation_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  water_body_id UUID NOT NULL REFERENCES public.water_bodies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  recommendations JSONB NOT NULL,
  conditions_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(water_body_id, date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_water_bodies_state ON public.water_bodies(state);
CREATE INDEX idx_water_bodies_name ON public.water_bodies USING gin(to_tsvector('english', name));
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_start_date ON public.trips(start_date);
CREATE INDEX idx_catch_reports_water_body ON public.catch_reports(water_body_id);
CREATE INDEX idx_catch_reports_caught_at ON public.catch_reports(caught_at);
CREATE INDEX idx_catch_reports_public ON public.catch_reports(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_expires_at ON public.subscriptions(expires_at);
CREATE INDEX idx_hatch_charts_region_month ON public.hatch_charts(region, month);
CREATE INDEX idx_recommendation_cache_expires ON public.recommendation_cache(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_waters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catch_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fly_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hatch_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Water Bodies: Anyone can read
CREATE POLICY "Anyone can view water bodies" ON public.water_bodies
  FOR SELECT USING (true);

-- Flies: Anyone can read
CREATE POLICY "Anyone can view flies" ON public.flies
  FOR SELECT USING (true);

-- Trips: Users can CRUD their own trips
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- Trip Waters: Users can manage waters on their own trips
CREATE POLICY "Users can view own trip waters" ON public.trip_waters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_waters.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "Users can add waters to own trips" ON public.trip_waters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_waters.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "Users can remove waters from own trips" ON public.trip_waters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_waters.trip_id AND trips.user_id = auth.uid())
  );

-- Catch Reports: Users can CRUD own, anyone can read public
CREATE POLICY "Anyone can view public catch reports" ON public.catch_reports
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create own catch reports" ON public.catch_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own catch reports" ON public.catch_reports
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own catch reports" ON public.catch_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Fly Shops: Anyone can read
CREATE POLICY "Anyone can view fly shops" ON public.fly_shops
  FOR SELECT USING (true);

-- Hatch Charts: Anyone can read
CREATE POLICY "Anyone can view hatch charts" ON public.hatch_charts
  FOR SELECT USING (true);

-- Recommendation Cache: Anyone can read (service role writes)
CREATE POLICY "Anyone can view recommendation cache" ON public.recommendation_cache
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SEED DATA: Sample Flies
-- ============================================

INSERT INTO public.flies (name, type, sizes, description, species_targets) VALUES
  ('Parachute Adams', 'dry', '12-20', 'Versatile mayfly imitation. Works in most conditions.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Elk Hair Caddis', 'dry', '12-18', 'Classic caddis pattern. Great for fast water.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Pheasant Tail Nymph', 'nymph', '14-20', 'Year-round producer. Imitates various mayfly nymphs.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Hares Ear Nymph', 'nymph', '12-18', 'Buggy profile attracts fish. Great searching pattern.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Woolly Bugger', 'streamer', '4-10', 'Versatile streamer. Can imitate leeches, baitfish, or crayfish.', ARRAY['rainbow trout', 'brown trout', 'bass', 'pike']),
  ('Copper John', 'nymph', '14-20', 'Heavy nymph for getting deep quickly. Flash attracts fish.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Blue Wing Olive', 'dry', '16-22', 'Matches common mayfly hatches. Essential for spring/fall.', ARRAY['rainbow trout', 'brown trout']),
  ('Griffiths Gnat', 'dry', '18-24', 'Small midge cluster pattern. Great for picky fish.', ARRAY['rainbow trout', 'brown trout']),
  ('San Juan Worm', 'nymph', '10-14', 'Simple but effective. Works especially after rain.', ARRAY['rainbow trout', 'brown trout', 'bass']),
  ('Stimulator', 'dry', '8-16', 'High-floating attractor. Great for stonefly hatches.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
  ('Clouser Minnow', 'streamer', '2-8', 'Weighted baitfish pattern. Effective in lakes and rivers.', ARRAY['bass', 'pike', 'trout']),
  ('Zebra Midge', 'nymph', '18-24', 'Simple midge larva pattern. Year-round producer.', ARRAY['rainbow trout', 'brown trout']),
  ('Prince Nymph', 'nymph', '12-18', 'Attractor nymph with peacock and white wings.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('RS2', 'emerger', '18-24', 'Sparse emerger pattern. Deadly during midge hatches.', ARRAY['rainbow trout', 'brown trout']),
  ('Chubby Chernobyl', 'dry', '8-14', 'High-floating foam pattern. Great hopper/attractor.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']);

-- ============================================
-- SEED DATA: Sample Water Bodies (Colorado)
-- ============================================

INSERT INTO public.water_bodies (name, type, state, city, latitude, longitude, species, description) VALUES
  ('South Platte River', 'river', 'CO', 'Denver', 39.7392, -104.9903, ARRAY['rainbow trout', 'brown trout'], 'Popular urban tailwater fishery with excellent year-round fishing.'),
  ('Arkansas River', 'river', 'CO', 'Buena Vista', 38.8422, -106.1311, ARRAY['rainbow trout', 'brown trout'], 'Gold Medal water with diverse hatches and beautiful scenery.'),
  ('Fryingpan River', 'river', 'CO', 'Basalt', 39.3689, -106.8431, ARRAY['rainbow trout', 'brown trout'], 'World-class tailwater known for large fish and technical fishing.'),
  ('Blue River', 'river', 'CO', 'Silverthorne', 39.6344, -106.0706, ARRAY['rainbow trout', 'brown trout'], 'Beautiful mountain tailwater below Dillon Reservoir.'),
  ('Cheesman Canyon', 'river', 'CO', 'Deckers', 39.2247, -105.2778, ARRAY['rainbow trout', 'brown trout'], 'Challenging technical water with large, wary trout.'),
  ('Eleven Mile Reservoir', 'lake', 'CO', 'Lake George', 38.9347, -105.5061, ARRAY['rainbow trout', 'brown trout', 'pike', 'kokanee salmon'], 'Large reservoir with excellent ice fishing and boat access.'),
  ('Dream Lake', 'lake', 'CO', 'Estes Park', 40.3089, -105.6567, ARRAY['brook trout', 'cutthroat trout'], 'Scenic alpine lake in Rocky Mountain National Park.'),
  ('Roaring Fork River', 'river', 'CO', 'Aspen', 39.1911, -106.8175, ARRAY['rainbow trout', 'brown trout', 'brook trout'], 'Freestone river with excellent dry fly fishing.'),
  ('Gunnison River', 'river', 'CO', 'Gunnison', 38.5458, -106.9253, ARRAY['rainbow trout', 'brown trout'], 'Large volume river with Gold Medal designation.'),
  ('Colorado River', 'river', 'CO', 'Kremmling', 40.0589, -106.3892, ARRAY['rainbow trout', 'brown trout'], 'Diverse sections from headwaters to canyons.');

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.water_bodies IS 'Rivers, lakes, and streams';
COMMENT ON TABLE public.flies IS 'Fly patterns for recommendations';
COMMENT ON TABLE public.trips IS 'User fishing trip plans';
