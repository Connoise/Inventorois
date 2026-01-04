// Database types generated from schema

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      locations: {
        Row: Location;
        Insert: Omit<Location, 'id' | 'created_at' | 'updated_at' | 'path_cache' | 'depth'>;
        Update: Partial<Omit<Location, 'id'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'>;
        Update: Partial<Omit<Tag, 'id'>>;
      };
      items: {
        Row: Item;
        Insert: Omit<Item, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Item, 'id'>>;
      };
      item_locations: {
        Row: ItemLocation;
        Insert: Omit<ItemLocation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ItemLocation, 'id'>>;
      };
      item_tags: {
        Row: ItemTag;
        Insert: ItemTag;
        Update: Partial<ItemTag>;
      };
      item_images: {
        Row: ItemImage;
        Insert: Omit<ItemImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ItemImage, 'id'>>;
      };
      change_history: {
        Row: ChangeHistory;
        Insert: Omit<ChangeHistory, 'id' | 'changed_at'>;
        Update: Partial<Omit<ChangeHistory, 'id'>>;
      };
      item_templates: {
        Row: ItemTemplate;
        Insert: Omit<ItemTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ItemTemplate, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id'>>;
      };
    };
  };
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'grid' | 'list';
  notificationsEnabled: boolean;
  compactMode: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  item_count?: number;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  location_type: 'building' | 'floor' | 'room' | 'area' | 'furniture' | 'shelf' | 'drawer' | 'container' | 'other';
  icon: string;
  color: string | null;
  sort_order: number;
  path_cache: string | null;
  depth: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationWithChildren extends Location {
  children?: LocationWithChildren[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TagWithCount extends Tag {
  count?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  quantity: number;
  unit: string;
  min_threshold: number | null;
  max_threshold: number | null;
  is_essential: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued';
  purchase_price: number | null;
  current_value: number | null;
  currency: string;
  barcode: string | null;
  sku: string | null;
  model_number: string | null;
  serial_number: string | null;
  acquired_date: string | null;
  expiration_date: string | null;
  warranty_expiration: string | null;
  last_checked_date: string | null;
  notes: string | null;
  custom_fields: Record<string, any>;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemWithRelations extends Item {
  category?: Category;
  locations?: (ItemLocation & { location: Location })[];
  tags?: Tag[];
  primary_location?: string;
}

export interface ItemLocation {
  id: string;
  item_id: string;
  location_id: string;
  quantity_at_location: number;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemTag {
  item_id: string;
  tag_id: string;
  created_at: string;
}

export interface ItemImage {
  id: string;
  item_id: string;
  storage_path: string;
  filename: string;
  mime_type: string | null;
  file_size: number | null;
  is_primary: boolean;
  caption: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
}

export interface ChangeHistory {
  id: string;
  entity_type: 'item' | 'category' | 'location' | 'tag';
  entity_id: string;
  entity_name: string | null;
  action: 'create' | 'update' | 'delete' | 'restore';
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  snapshot_before: Record<string, any> | null;
  snapshot_after: Record<string, any> | null;
  changed_by: string | null;
  changed_by_name: string | null;
  changed_at: string;
  is_undone: boolean;
  undone_by: string | null;
  undone_at: string | null;
}

export interface ItemTemplate {
  id: string;
  name: string;
  description: string | null;
  template_data: {
    category_id?: string;
    unit?: string;
    min_threshold?: number;
    is_essential?: boolean;
    suggested_tags?: string[];
    default_location_id?: string;
  };
  category_id: string | null;
  is_system: boolean;
  use_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'low_stock' | 'expiring_soon' | 'item_updated' | 'threshold_alert' | 'system' | 'reminder';
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  is_pushed: boolean;
  created_at: string;
  read_at: string | null;
  expires_at: string | null;
}

// Filter types
export interface ItemFilters {
  search?: string;
  category_id?: string;
  location_id?: string;
  status?: Item['status'];
  is_essential?: boolean;
  is_favorite?: boolean;
  is_archived?: boolean;
  tags?: string[];
}
