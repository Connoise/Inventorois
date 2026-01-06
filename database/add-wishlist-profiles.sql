-- Add new fields to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS expiration_date DATE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS needs_replacement BOOLEAN DEFAULT FALSE;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies - users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  notes TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Wishlist policies - all authenticated users can CRUD
CREATE POLICY "Users can view all wishlist items" ON wishlist FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert wishlist items" ON wishlist FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update wishlist items" ON wishlist FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete wishlist items" ON wishlist FOR DELETE TO authenticated USING (true);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_created_by ON wishlist(created_by);
CREATE INDEX IF NOT EXISTS idx_wishlist_priority ON wishlist(priority);
CREATE INDEX IF NOT EXISTS idx_items_expiration ON items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_items_needs_replacement ON items(needs_replacement);
