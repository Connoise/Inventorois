-- ============================================
-- HOUSEHOLD INVENTORY APP - DATABASE SCHEMA
-- Supabase/PostgreSQL Compatible
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- (Supabase Auth handles this, but we extend it)
-- ============================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    preferences JSONB DEFAULT '{
        "theme": "system",
        "defaultView": "grid",
        "notificationsEnabled": true,
        "compactMode": false
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES
-- Supports predefined + custom, with nesting
-- ============================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    icon TEXT DEFAULT 'folder',           -- Lucide icon name
    color TEXT DEFAULT '#6B7280',         -- Hex color
    sort_order INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE,      -- TRUE for predefined categories
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_category_name_per_parent UNIQUE (name, parent_id)
);

-- Index for faster tree traversal
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- LOCATIONS
-- Nested hierarchy: House > Room > Furniture > Shelf > Container
-- ============================================

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    location_type TEXT CHECK (location_type IN (
        'building', 'floor', 'room', 'area', 
        'furniture', 'shelf', 'drawer', 'container', 'other'
    )),
    icon TEXT DEFAULT 'map-pin',
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    -- Full path for easy querying (e.g., "House/Kitchen/Pantry/Top Shelf")
    path_cache TEXT,
    depth INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_location_name_per_parent UNIQUE (name, parent_id)
);

-- Indexes for location queries
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_path ON locations(path_cache);

-- ============================================
-- TAGS
-- Flexible labeling system
-- ============================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

-- ============================================
-- ITEMS
-- Core inventory table
-- ============================================

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Quantity & Thresholds
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit TEXT DEFAULT 'units',            -- units, pcs, kg, lbs, liters, etc.
    min_threshold DECIMAL(10, 2),         -- Alert when below this
    max_threshold DECIMAL(10, 2),         -- Optional max capacity
    
    -- Status Flags
    is_essential BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'in_stock' CHECK (status IN (
        'in_stock', 'low_stock', 'out_of_stock', 'on_order', 'discontinued'
    )),
    
    -- Financial
    purchase_price DECIMAL(10, 2),
    current_value DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    
    -- Identification
    barcode TEXT,
    sku TEXT,
    model_number TEXT,
    serial_number TEXT,
    
    -- Dates
    acquired_date DATE,
    expiration_date DATE,
    warranty_expiration DATE,
    last_checked_date TIMESTAMPTZ,
    
    -- Flexible Fields
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_essential ON items(is_essential) WHERE is_essential = TRUE;
CREATE INDEX idx_items_favorite ON items(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_items_archived ON items(is_archived);
CREATE INDEX idx_items_updated ON items(updated_at DESC);
CREATE INDEX idx_items_barcode ON items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_items_name_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- ITEM-LOCATION JUNCTION
-- Many-to-many: items can be in multiple locations
-- ============================================

CREATE TABLE item_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    quantity_at_location DECIMAL(10, 2) DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,     -- Primary storage location
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_item_location UNIQUE (item_id, location_id)
);

CREATE INDEX idx_item_locations_item ON item_locations(item_id);
CREATE INDEX idx_item_locations_location ON item_locations(location_id);

-- ============================================
-- ITEM-TAG JUNCTION
-- Many-to-many relationship
-- ============================================

CREATE TABLE item_tags (
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);

-- ============================================
-- ITEM IMAGES
-- For Phase 3 (self-hosted storage)
-- ============================================

CREATE TABLE item_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,           -- Path in Supabase Storage or local
    filename TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_item_images_item ON item_images(item_id);

-- ============================================
-- CHANGE HISTORY / AUDIT LOG
-- Track all modifications
-- ============================================

CREATE TABLE change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What changed
    entity_type TEXT NOT NULL CHECK (entity_type IN ('item', 'category', 'location', 'tag')),
    entity_id UUID NOT NULL,
    entity_name TEXT,                     -- Cached name for display
    
    -- Change details
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
    field_name TEXT,                      -- NULL for create/delete
    old_value TEXT,
    new_value TEXT,
    
    -- Full snapshot for undo (JSONB of entire record)
    snapshot_before JSONB,
    snapshot_after JSONB,
    
    -- Who and when
    changed_by UUID REFERENCES auth.users(id),
    changed_by_name TEXT,                 -- Cached for display
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Undo tracking
    is_undone BOOLEAN DEFAULT FALSE,
    undone_by UUID REFERENCES auth.users(id),
    undone_at TIMESTAMPTZ
);

-- Indexes for history queries
CREATE INDEX idx_history_entity ON change_history(entity_type, entity_id);
CREATE INDEX idx_history_changed_at ON change_history(changed_at DESC);
CREATE INDEX idx_history_changed_by ON change_history(changed_by);
CREATE INDEX idx_history_action ON change_history(action);

-- ============================================
-- ITEM TEMPLATES
-- Pre-filled item configurations
-- ============================================

CREATE TABLE item_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Template data (matches items table structure)
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    /*
    Example template_data:
    {
        "category_id": "uuid",
        "unit": "rolls",
        "min_threshold": 4,
        "is_essential": true,
        "tags": ["bathroom", "consumable"],
        "default_location_id": "uuid"
    }
    */
    
    -- Organization
    category_id UUID REFERENCES categories(id),
    is_system BOOLEAN DEFAULT FALSE,      -- Built-in templates
    use_count INTEGER DEFAULT 0,          -- Track popularity
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON item_templates(category_id);
CREATE INDEX idx_templates_popular ON item_templates(use_count DESC);

-- ============================================
-- NOTIFICATIONS
-- Push notification queue
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification content
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'low_stock', 'expiring_soon', 'item_updated', 
        'threshold_alert', 'system', 'reminder'
    )),
    
    -- Related entity
    entity_type TEXT,
    entity_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_pushed BOOLEAN DEFAULT FALSE,      -- Sent to device
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- USER PREFERENCES FOR PUSH NOTIFICATIONS
-- ============================================

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    device_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_item_locations_updated_at BEFORE UPDATE ON item_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON item_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update item status based on quantity/threshold
CREATE OR REPLACE FUNCTION update_item_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity <= 0 THEN
        NEW.status = 'out_of_stock';
    ELSIF NEW.min_threshold IS NOT NULL AND NEW.quantity <= NEW.min_threshold THEN
        NEW.status = 'low_stock';
    ELSE
        NEW.status = 'in_stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_item_status BEFORE INSERT OR UPDATE OF quantity, min_threshold ON items
    FOR EACH ROW EXECUTE FUNCTION update_item_status();

-- Update location path cache
CREATE OR REPLACE FUNCTION update_location_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path_cache = NEW.name;
        NEW.depth = 0;
    ELSE
        SELECT path_cache, depth INTO parent_path, parent_depth
        FROM locations WHERE id = NEW.parent_id;
        
        NEW.path_cache = parent_path || '/' || NEW.name;
        NEW.depth = parent_depth + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_location_path BEFORE INSERT OR UPDATE OF name, parent_id ON locations
    FOR EACH ROW EXECUTE FUNCTION update_location_path();

-- Create notification on low stock
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'low_stock' AND (OLD.status IS NULL OR OLD.status != 'low_stock') THEN
        INSERT INTO notifications (user_id, title, body, type, entity_type, entity_id)
        SELECT 
            up.id,
            'Low Stock Alert',
            NEW.name || ' is running low (' || NEW.quantity || ' ' || NEW.unit || ' remaining)',
            'low_stock',
            'item',
            NEW.id
        FROM user_profiles up
        WHERE up.preferences->>'notificationsEnabled' = 'true';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_low_stock_notification AFTER UPDATE OF status ON items
    FOR EACH ROW EXECUTE FUNCTION notify_low_stock();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Multi-user access control
-- ============================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- For household use: all authenticated users can read/write
-- (Adjust these for more granular permissions later)

CREATE POLICY "Authenticated users can view all items" ON items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert items" ON items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update items" ON items
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete items" ON items
    FOR DELETE TO authenticated USING (true);

-- Apply similar policies to other tables
CREATE POLICY "Authenticated access" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON item_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON item_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON item_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON change_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON item_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notifications are user-specific
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- User profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());

-- Push subscriptions are user-specific
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================
-- SEED DATA: Predefined Categories
-- ============================================

INSERT INTO categories (name, icon, color, is_system, sort_order) VALUES
    ('Kitchen & Pantry', 'utensils', '#F59E0B', TRUE, 1),
    ('Bathroom', 'bath', '#3B82F6', TRUE, 2),
    ('Cleaning Supplies', 'sparkles', '#10B981', TRUE, 3),
    ('Electronics', 'monitor', '#6366F1', TRUE, 4),
    ('Office & Stationery', 'pencil', '#8B5CF6', TRUE, 5),
    ('Bedroom & Linens', 'bed-double', '#EC4899', TRUE, 6),
    ('Tools & Hardware', 'wrench', '#6B7280', TRUE, 7),
    ('Health & Medicine', 'heart-pulse', '#EF4444', TRUE, 8),
    ('Pet Supplies', 'paw-print', '#F97316', TRUE, 9),
    ('Outdoor & Garden', 'tree-pine', '#22C55E', TRUE, 10),
    ('Storage & Organization', 'archive', '#78716C', TRUE, 11),
    ('Miscellaneous', 'box', '#9CA3AF', TRUE, 99);

-- Subcategories
INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Food & Groceries', id, 'apple', '#F59E0B', TRUE, 1 FROM categories WHERE name = 'Kitchen & Pantry';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Cookware & Utensils', id, 'chef-hat', '#F59E0B', TRUE, 2 FROM categories WHERE name = 'Kitchen & Pantry';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Small Appliances', id, 'zap', '#F59E0B', TRUE, 3 FROM categories WHERE name = 'Kitchen & Pantry';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Toiletries', id, 'droplet', '#3B82F6', TRUE, 1 FROM categories WHERE name = 'Bathroom';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Towels & Linens', id, 'square', '#3B82F6', TRUE, 2 FROM categories WHERE name = 'Bathroom';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Computers & Accessories', id, 'laptop', '#6366F1', TRUE, 1 FROM categories WHERE name = 'Electronics';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Phones & Tablets', id, 'smartphone', '#6366F1', TRUE, 2 FROM categories WHERE name = 'Electronics';

INSERT INTO categories (name, parent_id, icon, color, is_system, sort_order)
SELECT 'Cables & Chargers', id, 'cable', '#6366F1', TRUE, 3 FROM categories WHERE name = 'Electronics';

-- ============================================
-- SEED DATA: Common Item Templates
-- ============================================

INSERT INTO item_templates (name, description, template_data, is_system) VALUES
(
    'Paper Towels',
    'Household paper towels',
    '{"unit": "rolls", "min_threshold": 4, "is_essential": true, "suggested_tags": ["consumable", "cleaning"]}'::jsonb,
    TRUE
),
(
    'Toilet Paper',
    'Bathroom tissue',
    '{"unit": "rolls", "min_threshold": 8, "is_essential": true, "suggested_tags": ["consumable", "bathroom"]}'::jsonb,
    TRUE
),
(
    'Dish Soap',
    'Liquid dish detergent',
    '{"unit": "bottles", "min_threshold": 1, "is_essential": true, "suggested_tags": ["consumable", "cleaning", "kitchen"]}'::jsonb,
    TRUE
),
(
    'Laundry Detergent',
    'Clothes washing detergent',
    '{"unit": "bottles", "min_threshold": 1, "is_essential": true, "suggested_tags": ["consumable", "cleaning"]}'::jsonb,
    TRUE
),
(
    'Batteries (AA)',
    'AA alkaline batteries',
    '{"unit": "pcs", "min_threshold": 8, "is_essential": true, "suggested_tags": ["electronics", "consumable"]}'::jsonb,
    TRUE
),
(
    'Batteries (AAA)',
    'AAA alkaline batteries',
    '{"unit": "pcs", "min_threshold": 8, "is_essential": true, "suggested_tags": ["electronics", "consumable"]}'::jsonb,
    TRUE
),
(
    'Light Bulbs',
    'Standard light bulbs',
    '{"unit": "pcs", "min_threshold": 2, "suggested_tags": ["electronics", "consumable"]}'::jsonb,
    TRUE
),
(
    'Trash Bags',
    'Garbage bags',
    '{"unit": "bags", "min_threshold": 10, "is_essential": true, "suggested_tags": ["consumable", "cleaning"]}'::jsonb,
    TRUE
),
(
    'First Aid Kit',
    'Emergency medical supplies',
    '{"unit": "kits", "min_threshold": 1, "is_essential": true, "suggested_tags": ["health", "emergency"]}'::jsonb,
    TRUE
),
(
    'Hand Soap',
    'Hand washing soap',
    '{"unit": "bottles", "min_threshold": 2, "is_essential": true, "suggested_tags": ["consumable", "bathroom", "health"]}'::jsonb,
    TRUE
);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Items with low stock (essential items below threshold)
CREATE VIEW v_low_stock_essentials AS
SELECT 
    i.*,
    c.name as category_name,
    COALESCE(
        (SELECT string_agg(l.path_cache, ', ')
         FROM item_locations il
         JOIN locations l ON l.id = il.location_id
         WHERE il.item_id = i.id),
        'No location'
    ) as locations
FROM items i
LEFT JOIN categories c ON c.id = i.category_id
WHERE i.is_essential = TRUE
  AND i.is_archived = FALSE
  AND i.status IN ('low_stock', 'out_of_stock')
ORDER BY i.quantity ASC;

-- Recently modified items
CREATE VIEW v_recent_changes AS
SELECT 
    i.*,
    c.name as category_name,
    up.display_name as updated_by_name
FROM items i
LEFT JOIN categories c ON c.id = i.category_id
LEFT JOIN user_profiles up ON up.id = i.updated_by
WHERE i.is_archived = FALSE
ORDER BY i.updated_at DESC
LIMIT 50;

-- Favorite items
CREATE VIEW v_favorites AS
SELECT 
    i.*,
    c.name as category_name,
    COALESCE(
        (SELECT string_agg(l.path_cache, ', ')
         FROM item_locations il
         JOIN locations l ON l.id = il.location_id
         WHERE il.item_id = i.id AND il.is_primary = TRUE),
        'No location'
    ) as primary_location
FROM items i
LEFT JOIN categories c ON c.id = i.category_id
WHERE i.is_favorite = TRUE
  AND i.is_archived = FALSE
ORDER BY i.name ASC;

-- Items expiring soon (within 30 days)
CREATE VIEW v_expiring_soon AS
SELECT 
    i.*,
    c.name as category_name,
    i.expiration_date - CURRENT_DATE as days_until_expiry
FROM items i
LEFT JOIN categories c ON c.id = i.category_id
WHERE i.expiration_date IS NOT NULL
  AND i.expiration_date <= CURRENT_DATE + INTERVAL '30 days'
  AND i.is_archived = FALSE
ORDER BY i.expiration_date ASC;
