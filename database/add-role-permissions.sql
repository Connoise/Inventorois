-- ============================================================================
-- User Role-Based Permissions Migration
-- ============================================================================
-- This migration adds role-based access control to the inventory app
-- IMPORTANT: This migration sets im@connoi.se as owner BEFORE restricting access

-- ============================================================================
-- PART 1: Add Role Field and Set Admin User (CRITICAL - DO FIRST)
-- ============================================================================

-- 1. Add role field to profiles table (consolidate to this table as source of truth)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer'
  CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

-- 2. Migrate existing role data from user_profiles to profiles (if any exists)
UPDATE profiles p
SET role = up.role
FROM user_profiles up
WHERE p.id = up.id AND up.role IS NOT NULL;

-- 3. CRITICAL: Set im@connoi.se as owner BEFORE enabling restrictions
UPDATE profiles
SET role = 'owner'
WHERE email = 'im@connoi.se';

-- Verify the owner is set (check output)
SELECT id, email, display_name, role FROM profiles WHERE email = 'im@connoi.se';

-- 4. Update trigger to include role with 'viewer' default for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 2: Helper Functions for RLS Policies
-- ============================================================================

-- Get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('owner', 'admin') FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user can modify items (member, admin, or owner)
CREATE OR REPLACE FUNCTION public.can_modify_items(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('owner', 'admin', 'member') FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- PART 3: Drop Existing Permissive RLS Policies
-- ============================================================================

-- Items
DROP POLICY IF EXISTS "Authenticated users can view all items" ON items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON items;

-- Categories
DROP POLICY IF EXISTS "Authenticated access" ON categories;

-- Locations
DROP POLICY IF EXISTS "Authenticated access" ON locations;

-- Tags
DROP POLICY IF EXISTS "Authenticated access" ON tags;

-- Item Locations
DROP POLICY IF EXISTS "Authenticated access" ON item_locations;

-- Item Tags
DROP POLICY IF EXISTS "Authenticated access" ON item_tags;

-- Item Images
DROP POLICY IF EXISTS "Authenticated access" ON item_images;

-- Item Templates
DROP POLICY IF EXISTS "Authenticated access" ON item_templates;

-- Change History
DROP POLICY IF EXISTS "Authenticated access" ON change_history;

-- ============================================================================
-- PART 4: Create Role-Based RLS Policies for Items
-- ============================================================================

-- All users can view items (including viewers)
CREATE POLICY "All users can view items" ON items
  FOR SELECT TO authenticated USING (true);

-- Members+ can create items (member, admin, owner)
CREATE POLICY "Members can create items" ON items
  FOR INSERT TO authenticated
  WITH CHECK (public.can_modify_items(auth.uid()));

-- Members+ can update items
CREATE POLICY "Members can update items" ON items
  FOR UPDATE TO authenticated
  USING (public.can_modify_items(auth.uid()));

-- Only admins+ can delete items (admin, owner)
CREATE POLICY "Admins can delete items" ON items
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- PART 5: Create Role-Based RLS Policies for Categories
-- ============================================================================

-- All users can view categories
CREATE POLICY "All users can view categories" ON categories
  FOR SELECT TO authenticated USING (true);

-- Only admins+ can manage categories (insert, update, delete)
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- PART 6: Create Role-Based RLS Policies for Locations
-- ============================================================================

-- All users can view locations
CREATE POLICY "All users can view locations" ON locations
  FOR SELECT TO authenticated USING (true);

-- Only admins+ can manage locations
CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- PART 7: Create Role-Based RLS Policies for Tags
-- ============================================================================

-- All users can view tags
CREATE POLICY "All users can view tags" ON tags
  FOR SELECT TO authenticated USING (true);

-- Only admins+ can manage tags
CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- PART 8: Create Role-Based RLS Policies for Item Locations
-- ============================================================================

-- All users can view item-location relationships
CREATE POLICY "All users can view item locations" ON item_locations
  FOR SELECT TO authenticated USING (true);

-- Members+ can manage item locations (add items to locations)
CREATE POLICY "Members can manage item locations" ON item_locations
  FOR ALL TO authenticated
  USING (public.can_modify_items(auth.uid()))
  WITH CHECK (public.can_modify_items(auth.uid()));

-- ============================================================================
-- PART 9: Create Role-Based RLS Policies for Item Tags
-- ============================================================================

-- All users can view item-tag relationships
CREATE POLICY "All users can view item tags" ON item_tags
  FOR SELECT TO authenticated USING (true);

-- Members+ can manage item tags
CREATE POLICY "Members can manage item tags" ON item_tags
  FOR ALL TO authenticated
  USING (public.can_modify_items(auth.uid()))
  WITH CHECK (public.can_modify_items(auth.uid()));

-- ============================================================================
-- PART 10: Create Role-Based RLS Policies for Item Images
-- ============================================================================

-- All users can view item images
CREATE POLICY "All users can view item images" ON item_images
  FOR SELECT TO authenticated USING (true);

-- Members+ can manage item images
CREATE POLICY "Members can manage item images" ON item_images
  FOR ALL TO authenticated
  USING (public.can_modify_items(auth.uid()))
  WITH CHECK (public.can_modify_items(auth.uid()));

-- ============================================================================
-- PART 11: Create Role-Based RLS Policies for Item Templates
-- ============================================================================

-- All users can view templates
CREATE POLICY "All users can view templates" ON item_templates
  FOR SELECT TO authenticated USING (true);

-- Only admins+ can manage templates
CREATE POLICY "Admins can manage templates" ON item_templates
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- PART 12: Create Role-Based RLS Policies for Change History
-- ============================================================================

-- All users can view change history (audit trail)
CREATE POLICY "All users can view change history" ON change_history
  FOR SELECT TO authenticated USING (true);

-- System/Members+ can insert change history (logs their own changes)
CREATE POLICY "Members can log changes" ON change_history
  FOR INSERT TO authenticated
  WITH CHECK (public.can_modify_items(auth.uid()));

-- ============================================================================
-- PART 13: Update Profiles RLS Policies
-- ============================================================================

-- Drop old profile update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Users can update their own profile BUT NOT their role
CREATE POLICY "Users can update own non-role fields" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent non-admins from changing their own role
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Admins can update any user's role
CREATE POLICY "Admins can update user roles" ON profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the migration worked:

-- 1. Check owner is set
-- SELECT id, email, display_name, role FROM profiles WHERE email = 'im@connoi.se';
-- Expected: role = 'owner'

-- 2. List all users and their roles
-- SELECT email, display_name, role, created_at FROM profiles ORDER BY created_at;

-- 3. Test helper functions
-- SELECT public.is_admin(id), public.can_modify_items(id), role
-- FROM profiles WHERE email = 'im@connoi.se';
-- Expected: is_admin = true, can_modify_items = true, role = 'owner'

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (In case you need to revert)
-- ============================================================================

-- To rollback to permissive policies:
/*
-- Drop all role-based policies
DROP POLICY IF EXISTS "All users can view items" ON items;
DROP POLICY IF EXISTS "Members can create items" ON items;
DROP POLICY IF EXISTS "Members can update items" ON items;
DROP POLICY IF EXISTS "Admins can delete items" ON items;
-- ... (drop all other policies)

-- Recreate permissive policies
CREATE POLICY "Authenticated access" ON items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- ... (recreate for all tables)
*/
