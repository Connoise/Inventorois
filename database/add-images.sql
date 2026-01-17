-- ============================================================================
-- Image Storage Migration
-- ============================================================================
-- Migration Order: Run this AFTER schema.sql
-- Next Migration: add-wishlist-profiles.sql
--
-- This migration:
-- 1. Adds image_url column to items table (single image per item)
-- 2. Creates Supabase Storage bucket for images
-- 3. Sets up storage access policies
--
-- Note: The item_images table in schema.sql is deprecated.
-- Use items.image_url for single image per item.
-- ============================================================================

-- Add image_url column to items table (single image per item)
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

-- Allow authenticated users to update their images
CREATE POLICY "Users can update item images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'item-images');

-- Allow authenticated users to delete their images
CREATE POLICY "Users can delete item images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images');

-- Allow public read access to item images
CREATE POLICY "Public read access for item images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');
