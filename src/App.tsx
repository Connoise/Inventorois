import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Home, Package, FolderTree, MapPin, Tags, FileText, History, Settings,
  Plus, Search, Filter, Grid, List, Moon, Sun, Bell, Menu, X, ChevronRight,
  ChevronDown, Star, StarOff, AlertTriangle, Edit2, Trash2, Download,
  MoreVertical, Clock, Undo2, LogOut, Loader2, Camera, Image as ImageIcon,
  BarChart3, ShoppingCart, Users, User, Calendar, RefreshCw, CheckCircle,
  TrendingDown, TrendingUp, DollarSign, AlertCircle, PieChart, Upload, Palette
} from 'lucide-react';

import { useAuth } from './hooks';
import { useItems, useCategories, useLocations, useTags, useTemplates, useHistory, useNotifications, useCurrentUser, useUsers } from './hooks';
import { useUIStore, useFilterStore, useUndoStore, umaThemes, getThemeColors } from './stores';
import { formatRelativeTime, getStatusColor, getStatusLabel, exportToCSV } from './utils';
import { ROLE_LABELS, canManageUsers } from './utils/permissions';
import { signIn, signUp, signOut } from './lib/supabase';
import { supabase } from './lib/supabase';
import type { ItemWithRelations, LocationWithChildren } from './types/supabase';

// ============================================
// CONSTANTS
// ============================================
const LOCATION_TYPES = [
  { value: 'building', label: 'Building' },
  { value: 'floor', label: 'Floor' },
  { value: 'room', label: 'Room' },
  { value: 'area', label: 'Area' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'shelf', label: 'Shelf' },
  { value: 'drawer', label: 'Drawer' },
  { value: 'container', label: 'Container' },
  { value: 'other', label: 'Other' },
];

// Expanded color palette
const COLOR_OPTIONS = [
  // Reds
  '#EF4444', '#DC2626', '#B91C1C', '#F87171',
  // Oranges
  '#F97316', '#EA580C', '#FB923C',
  // Yellows
  '#F59E0B', '#EAB308', '#FACC15',
  // Greens
  '#84CC16', '#22C55E', '#10B981', '#059669', '#047857',
  // Teals/Cyans
  '#14B8A6', '#06B6D4', '#0891B2',
  // Blues
  '#0EA5E9', '#3B82F6', '#2563EB', '#1D4ED8',
  // Indigos/Purples
  '#6366F1', '#4F46E5', '#8B5CF6', '#7C3AED', '#A855F7', '#9333EA',
  // Pinks/Magentas
  '#D946EF', '#C026D3', '#EC4899', '#DB2777', '#F43F5E', '#E11D48',
  // Neutrals
  '#6B7280', '#78716C', '#71717A', '#52525B', '#404040',
];

// Expanded icon options organized by category
const ICON_OPTIONS = [
  // Home & Rooms
  '🏠', '🏡', '🏢', '🛏️', '🛋️', '🚿', '🛁', '🚽', '🪑', '🚪',
  // Kitchen & Food
  '🍳', '🍴', '🥄', '🍽️', '🧊', '🥫', '🍶', '☕', '🧂', '🥡',
  // Cleaning & Supplies
  '✨', '🧹', '🧺', '🧴', '🧼', '🧽', '🪣', '🧻', '🗑️',
  // Tools & Hardware
  '🔧', '🔨', '🪛', '🔩', '⚙️', '🪚', '📐', '🔌', '💡', '🔋',
  // Electronics & Tech
  '💻', '🖥️', '📱', '🎮', '🎧', '📷', '🖨️', '💾', '📺', '🔊',
  // Office & Stationery
  '📝', '📁', '📂', '📎', '✂️', '📌', '🖊️', '📒', '📚', '🗂️',
  // Health & Personal
  '💊', '🩹', '🧴', '🪥', '🧪', '💉', '🩺', '👓', '💄', '🧴',
  // Clothing & Accessories
  '👕', '👖', '👗', '👔', '🧥', '👟', '👜', '🎒', '👒', '🧤',
  // Outdoor & Sports
  '🌳', '🌿', '🪴', '⚽', '🏀', '🎾', '🚲', '⛺', '🎣', '🏊',
  // Pets & Animals
  '🐕', '🐈', '🐠', '🐦', '🐹', '🦎',
  // Vehicles & Transport
  '🚗', '🚙', '🏍️', '🚁', '⛵', '🛒',
  // Art & Craft
  '🎨', '🖼️', '✏️', '🧵', '🧶', '🎭',
  // Misc
  '📦', '🎁', '🔑', '🏷️', '⭐', '❤️', '🔒', '📍', '🎯', '💎',
];

// ============================================
// MODAL COMPONENT
// ============================================
const Modal = memo(({ 
  show, 
  onClose, 
  title, 
  children, 
  darkMode = false 
}: {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  darkMode?: boolean;
}) => {
  if (!show) return null;

  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative ${bgCard} rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        <div className={`p-4 border-b ${borderColor} flex justify-between items-center sticky top-0 ${bgCard} z-10`}>
          <h2 className={`text-xl font-semibold ${textPrimary}`}>{title}</h2>
          <button onClick={onClose} className={`p-1 rounded hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
            <X size={24} className={textSecondary} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});

// ============================================
// FORM COMPONENTS - Isolated to prevent re-render issues
// ============================================

// Location Form Component
const LocationForm = memo(({ 
  onSubmit, 
  onCancel, 
  locationOptions,
  darkMode 
}: {
  onSubmit: (data: { name: string; location_type: string; parent_id: string }) => void;
  onCancel: () => void;
  locationOptions: { id: string; path: string; depth: number }[];
  darkMode: boolean;
}) => {
  const [name, setName] = useState('');
  const [locationType, setLocationType] = useState('room');
  const [parentId, setParentId] = useState('');

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, location_type: locationType, parent_id: parentId });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Location Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          placeholder="e.g., Kitchen, Pantry"
          required
          autoFocus
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Type *</label>
        <select
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          {LOCATION_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Parent Location</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          <option value="">None (Top Level)</option>
          {locationOptions.map(loc => (
            <option key={loc.id} value={loc.id}>{'  '.repeat(loc.depth)}{loc.path}</option>
          ))}
        </select>
      </div>
      <div className={`flex justify-end gap-3 pt-4 border-t ${borderColor}`}>
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Add Location
        </button>
      </div>
    </form>
  );
});

// Tag Form Component
const TagForm = memo(({ 
  onSubmit, 
  onCancel, 
  darkMode 
}: {
  onSubmit: (data: { name: string; color: string }) => void;
  onCancel: () => void;
  darkMode: boolean;
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.toLowerCase().trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Tag Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          placeholder="e.g., consumable"
          required
          autoFocus
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className={`flex justify-end gap-3 pt-4 border-t ${borderColor}`}>
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Add Tag
        </button>
      </div>
    </form>
  );
});

// Category Form Component
const CategoryForm = memo(({ 
  onSubmit, 
  onCancel, 
  categories,
  initialData,
  isEditMode = false,
  darkMode 
}: {
  onSubmit: (data: { id?: string; name: string; icon: string; color: string; parent_id: string }) => void;
  onCancel: () => void;
  categories: { id: string; name: string }[];
  initialData?: { id: string; name: string; icon: string; color: string; parent_id: string | null };
  isEditMode?: boolean;
  darkMode: boolean;
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || '📦');
  const [color, setColor] = useState(initialData?.color || '#6B7280');
  const [parentId, setParentId] = useState(initialData?.parent_id || '');
  const [showAllIcons, setShowAllIcons] = useState(false);

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: initialData?.id, name, icon, color, parent_id: parentId });
  };

  // Show limited icons initially, expand on click
  const displayedIcons = showAllIcons ? ICON_OPTIONS : ICON_OPTIONS.slice(0, 24);

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Category Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          required
          autoFocus
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Icon</label>
        <div className="flex flex-wrap gap-2">
          {displayedIcons.map(ic => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 ${icon === ic ? 'border-blue-500' : 'border-transparent'} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              {ic}
            </button>
          ))}
          {!showAllIcons && ICON_OPTIONS.length > 24 && (
            <button
              type="button"
              onClick={() => setShowAllIcons(true)}
              className={`w-9 h-9 rounded-lg text-xs flex items-center justify-center border-2 border-dashed ${borderColor} ${textSecondary}`}
            >
              +{ICON_OPTIONS.length - 24}
            </button>
          )}
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Color</label>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Parent Category</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          <option value="">None (Top Level)</option>
          {categories.filter(cat => cat.id !== initialData?.id).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className={`flex justify-end gap-3 pt-4 border-t ${borderColor}`}>
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          {isEditMode ? 'Save Changes' : 'Add Category'}
        </button>
      </div>
    </form>
  );
});

// Item Form Component - Supports both Add and Edit modes
const ItemForm = memo(({ 
  onSubmit, 
  onCancel, 
  categories,
  locationOptions,
  tags: availableTags,
  onCreateTag,
  initialData,
  isEditMode = false,
  darkMode 
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  categories: { id: string; name: string }[];
  locationOptions: { id: string; path: string; depth: number; name: string }[];
  tags: { id: string; name: string; color: string }[];
  onCreateTag?: (tag: { name: string; color: string }) => Promise<{ id: string; name: string; color: string } | null>;
  initialData?: { 
    id?: string;
    name?: string; 
    quantity?: number;
    unit?: string; 
    category_id?: string;
    location_id?: string;
    min_threshold?: string; 
    purchase_price?: string;
    is_essential?: boolean; 
    is_favorite?: boolean;
    image_url?: string;
    tag_ids?: string[];
    notes?: string;
    expiration_date?: string;
    acquired_date?: string;
    needs_replacement?: boolean;
    throw_away_soon?: boolean;
  };
  isEditMode?: boolean;
  darkMode: boolean;
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [unit, setUnit] = useState(initialData?.unit || 'units');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [locationId, setLocationId] = useState(initialData?.location_id || '');
  const [minThreshold, setMinThreshold] = useState(initialData?.min_threshold || '');
  const [price, setPrice] = useState(initialData?.purchase_price || '');
  const [isEssential, setIsEssential] = useState(initialData?.is_essential || false);
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tag_ids || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [expirationDate, setExpirationDate] = useState(initialData?.expiration_date || '');
  const [acquiredDate, setAcquiredDate] = useState(initialData?.acquired_date || '');
  const [needsReplacement, setNeedsReplacement] = useState(initialData?.needs_replacement || false);
  const [throwAwaySoon, setThrowAwaySoon] = useState(initialData?.throw_away_soon || false);
  
  // Inline tag creation state
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [localTags, setLocalTags] = useState(availableTags);

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  // Update local tags when availableTags changes
  useEffect(() => {
    setLocalTags(availableTags);
  }, [availableTags]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateNewTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;
    
    const newTag = await onCreateTag({ name: newTagName.trim(), color: newTagColor });
    if (newTag) {
      setLocalTags(prev => [...prev, newTag]);
      setSelectedTags(prev => [...prev, newTag.id]);
      setNewTagName('');
      setShowNewTagForm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name,
        quantity,
        unit,
        category_id: categoryId,
        location_id: locationId,
        min_threshold: minThreshold,
        purchase_price: price,
        is_essential: isEssential,
        is_favorite: isFavorite,
        tag_ids: selectedTags,
        image_file: imageFile,
        image_url: imagePreview && !imageFile ? imagePreview : null,
        notes,
        expiration_date: expirationDate || null,
        acquired_date: acquiredDate || null,
        needs_replacement: needsReplacement,
        throw_away_soon: throwAwaySoon,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group locations by parent for better visual hierarchy
  const groupedLocations = locationOptions.reduce((acc, loc) => {
    if (loc.depth === 0) {
      acc.push({ ...loc, children: [] });
    } else {
      // Find parent group
      const parentPath = loc.path.split(' → ').slice(0, -1).join(' → ');
      const parent = acc.find(p => p.path === parentPath || loc.path.startsWith(p.path + ' → '));
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(loc);
      } else {
        acc.push({ ...loc, children: [] });
      }
    }
    return acc;
  }, [] as (typeof locationOptions[0] & { children: typeof locationOptions })[]);

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Photo Upload Section */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Photo</label>
        <div className="flex items-center gap-3">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Camera capture button */}
              <label className={`w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed ${borderColor} rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Camera size={18} className={textSecondary} />
                <span className={`text-xs ${textSecondary} mt-0.5`}>Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {/* Gallery selection button */}
              <label className={`w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed ${borderColor} rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Upload size={18} className={textSecondary} />
                <span className={`text-xs ${textSecondary} mt-0.5`}>Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Item Name */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Item Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          required
          autoFocus
        />
      </div>

      {/* Quantity & Unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
            min="0"
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          >
            <option value="units">units</option>
            <option value="pcs">pcs</option>
            <option value="rolls">rolls</option>
            <option value="bottles">bottles</option>
            <option value="boxes">boxes</option>
            <option value="bags">bags</option>
            <option value="cans">cans</option>
            <option value="pairs">pairs</option>
            <option value="sets">sets</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          <option value="">Select category</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* Location - Improved nested dropdown */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          <option value="">Select location</option>
          {locationOptions.map(loc => {
            // Create visual indentation based on depth
            const indent = loc.depth > 0 ? '│ '.repeat(loc.depth - 1) + '├─ ' : '';
            const displayName = loc.path.split(' → ').pop() || loc.path;
            return (
              <option key={loc.id} value={loc.id} style={{ paddingLeft: loc.depth * 12 }}>
                {indent}{displayName}
              </option>
            );
          })}
        </select>
        {locationId && (
          <p className={`text-xs ${textSecondary} mt-1`}>
            Full path: {locationOptions.find(l => l.id === locationId)?.path}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Tags</label>
        <div className="space-y-2">
          {/* Existing tags */}
          <div className="flex flex-wrap gap-2">
            {localTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag.id)
                    ? 'ring-2 ring-offset-1 ring-blue-500'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: tag.color + '30', 
                  color: darkMode ? '#fff' : tag.color,
                  borderColor: tag.color
                }}
              >
                {tag.name}
              </button>
            ))}
            {/* Add new tag button */}
            {onCreateTag && !showNewTagForm && (
              <button
                type="button"
                onClick={() => setShowNewTagForm(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium border-2 border-dashed ${borderColor} ${textSecondary} hover:border-blue-500 hover:text-blue-500 transition-colors`}
              >
                + New Tag
              </button>
            )}
          </div>
          
          {/* Inline new tag form */}
          {showNewTagForm && (
            <div className={`p-3 rounded-lg border ${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} space-y-2`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className={`flex-1 p-2 rounded border ${borderColor} ${inputBg} ${textPrimary} text-sm`}
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      className={`w-6 h-6 rounded-full ${newTagColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateNewTag}
                  disabled={!newTagName.trim()}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Add Tag
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewTagForm(false); setNewTagName(''); }}
                  className={`px-3 py-1 text-sm rounded border ${borderColor} ${textPrimary}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Min Threshold & Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Min Stock Alert</label>
          <input
            type="number"
            value={minThreshold}
            onChange={(e) => setMinThreshold(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
            min="0"
            placeholder="Alert when below"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
            min="0"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Purchase Date</label>
          <input
            type="date"
            value={acquiredDate}
            onChange={(e) => setAcquiredDate(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Expiration Date</label>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary} resize-none`}
          placeholder="Additional notes about this item..."
        />
      </div>

      {/* Flags */}
      <div className="flex flex-wrap items-center gap-4">
        <label className={`flex items-center gap-2 ${textPrimary} cursor-pointer`}>
          <input 
            type="checkbox" 
            checked={isEssential} 
            onChange={(e) => setIsEssential(e.target.checked)}
            className="w-4 h-4 rounded"
          /> 
          <span className="text-sm">Essential</span>
        </label>
        <label className={`flex items-center gap-2 ${textPrimary} cursor-pointer`}>
          <input 
            type="checkbox" 
            checked={isFavorite} 
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="w-4 h-4 rounded"
          /> 
          <span className="text-sm">Favorite</span>
        </label>
        <label className={`flex items-center gap-2 text-orange-500 cursor-pointer`}>
          <input 
            type="checkbox" 
            checked={needsReplacement} 
            onChange={(e) => setNeedsReplacement(e.target.checked)}
            className="w-4 h-4 rounded"
          /> 
          <span className="text-sm">Needs Replacement</span>
        </label>
        <label className={`flex items-center gap-2 text-red-500 cursor-pointer`}>
          <input 
            type="checkbox" 
            checked={throwAwaySoon} 
            onChange={(e) => setThrowAwaySoon(e.target.checked)}
            className="w-4 h-4 rounded"
          /> 
          <span className="text-sm">Throw Away Soon</span>
        </label>
      </div>

      {/* Submit Buttons */}
      <div className={`flex justify-end gap-3 pt-4 border-t ${borderColor} sticky bottom-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} -mx-4 px-4 pb-2`}>
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isEditMode ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </form>
  );
});

// ============================================
// STATUS BADGE COMPONENT
// ============================================
const StatusBadge = memo(({ status }: { status: string }) => {
  const { bg, text } = getStatusColor(status);
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {getStatusLabel(status)}
    </span>
  );
});

// ============================================
// AUTH SCREEN COMPONENT
// ============================================
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Package size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Inventorois</h1>
        </div>

        <h2 className="text-xl font-semibold text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 font-medium hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
function MainApp() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode, viewMode, setViewMode, showFilters, toggleFilters, showAddModal, openAddModal, closeAddModal, currentTheme, setTheme, getTheme } = useUIStore();
  const { filters, setSearch, setFilter, clearFilters } = useFilterStore();
  const { showUndoToast, hideToast } = useUndoStore();
  
  const { items, loading: itemsLoading, updateQuantity, toggleFavorite, createItem, updateItem, archiveItem } = useItems();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { locations, locationOptions, createLocation, deleteLocation } = useLocations();
  const { tags, createTag, deleteTag } = useTags();
  const { templates, useTemplate, createTemplate, deleteTemplate } = useTemplates();
  const { history, undoChange } = useHistory();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Permission hooks for role-based access control
  const { profile: currentUserProfile } = useCurrentUser();
  const canAddItems = currentUserProfile ? currentUserProfile.role !== 'viewer' : false;
  const canDeleteItems = currentUserProfile ? ['owner', 'admin'].includes(currentUserProfile.role) : false;
  const canManageStructure = currentUserProfile ? ['owner', 'admin'].includes(currentUserProfile.role) : false;

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showItemMenu, setShowItemMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ItemWithRelations | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; icon: string; color: string; parent_id: string | null } | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEssential, setFilterEssential] = useState(false);
  const [inventoryViewMode, setInventoryViewMode] = useState<'all' | 'byLocation'>('all');
  
  // Template data for item form
  const [itemFormInitialData, setItemFormInitialData] = useState<any>(null);

  // Get current theme and colors based on dark mode
  const theme = getTheme();
  const isDefaultTheme = currentTheme === 'default';
  const themeColors = getThemeColors(theme, darkMode);

  // Theme-based styles - now works with both light and dark modes for all themes
  // Include text color in main styles for CSS inheritance to all children
  const bgMain = isDefaultTheme 
    ? (darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900')
    : '';
  const bgMainStyle = !isDefaultTheme ? { 
    backgroundColor: themeColors.background,
    color: themeColors.text 
  } : {};
  
  const bgCard = isDefaultTheme
    ? (darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900')
    : '';
  const bgCardStyle = !isDefaultTheme ? { 
    backgroundColor: themeColors.card,
    color: themeColors.text 
  } : {};
  
  // These are now just for explicit overrides when needed
  const textPrimary = isDefaultTheme 
    ? (darkMode ? 'text-white' : 'text-gray-900')
    : '';
  const textPrimaryStyle = !isDefaultTheme ? { color: themeColors.text } : {};
  
  const textSecondary = isDefaultTheme 
    ? (darkMode ? 'text-gray-400' : 'text-gray-600')
    : '';
  const textSecondaryStyle = !isDefaultTheme ? { color: themeColors.textSecondary } : {};
  
  const borderColor = isDefaultTheme 
    ? (darkMode ? 'border-gray-700' : 'border-gray-200')
    : '';
  const borderColorStyle = !isDefaultTheme ? { borderColor: themeColors.border } : {};
  
  const inputBg = isDefaultTheme 
    ? (darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900')
    : '';
  const inputBgStyle = !isDefaultTheme ? { 
    backgroundColor: themeColors.card,
    color: themeColors.text 
  } : {};
  
  // Theme colors for accents - works in both modes
  const accentColor = themeColors.primary;
  const accentColorSecondary = themeColors.secondary;
  const accentColorHighlight = themeColors.accent;
  const highlightBg = themeColors.highlight;

  // Apply theme font
  useEffect(() => {
    if (!isDefaultTheme) {
      document.body.style.fontFamily = theme.fontFamily;
    } else {
      document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    }
    return () => {
      document.body.style.fontFamily = '';
    };
  }, [currentTheme, theme.fontFamily, isDefaultTheme]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: ShoppingCart },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'tags', label: 'Tags', icon: Tags },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Handle form submissions
  const handleCreateItem = useCallback(async (data: any) => {
    try {
      // Create the item first
      const newItem = await createItem(
        {
          name: data.name,
          quantity: data.quantity,
          unit: data.unit,
          category_id: data.category_id || null,
          min_threshold: data.min_threshold ? parseFloat(data.min_threshold) : null,
          purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
          is_essential: data.is_essential,
          is_favorite: data.is_favorite,
          needs_replacement: data.needs_replacement || false,
          throw_away_soon: data.throw_away_soon || false,
          description: null,
          is_archived: false,
          max_threshold: null,
          current_value: null,
          currency: 'USD',
          barcode: null,
          sku: null,
          model_number: null,
          serial_number: null,
          acquired_date: data.acquired_date || null,
          expiration_date: data.expiration_date || null,
          warranty_expiration: null,
          last_checked_date: null,
          notes: data.notes || null,
          image_url: null,
          custom_fields: {},
        },
        data.location_id || undefined,
        data.tag_ids || undefined
      );

      // If there's an image file, upload it
      if (data.image_file && newItem) {
        try {
          const { uploadItemImage, compressImage } = await import('./services/images');
          // Compress the image before uploading
          const compressedFile = await compressImage(data.image_file, 800);
          const imageUrl = await uploadItemImage(compressedFile, newItem.id);
          // Update the item with the image URL
          await updateItem(newItem.id, { image_url: imageUrl });
        } catch (imgErr) {
          console.error('Failed to upload image:', imgErr);
          // Don't fail the whole operation if image upload fails
        }
      }

      setItemFormInitialData(null);
      closeAddModal();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert('Failed to create item.');
    }
  }, [createItem, updateItem, closeAddModal]);

  // Handle edit item
  const handleEditItem = useCallback((item: ItemWithRelations) => {
    setEditingItem(item);
  }, []);

  // Handle update item
  const handleUpdateItem = useCallback(async (data: any) => {
    if (!data.id) return;
    
    try {
      // Update the item
      await updateItem(
        data.id,
        {
          name: data.name,
          quantity: data.quantity,
          unit: data.unit,
          category_id: data.category_id || null,
          min_threshold: data.min_threshold ? parseFloat(data.min_threshold) : null,
          purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
          is_essential: data.is_essential,
          is_favorite: data.is_favorite,
          needs_replacement: data.needs_replacement || false,
          throw_away_soon: data.throw_away_soon || false,
          notes: data.notes || null,
          expiration_date: data.expiration_date || null,
          acquired_date: data.acquired_date || null,
        },
        data.location_id || undefined,
        data.tag_ids
      );

      // If there's a new image file, upload it
      if (data.image_file) {
        try {
          const { uploadItemImage, compressImage } = await import('./services/images');
          const compressedFile = await compressImage(data.image_file, 800);
          const imageUrl = await uploadItemImage(compressedFile, data.id);
          await updateItem(data.id, { image_url: imageUrl });
        } catch (imgErr) {
          console.error('Failed to upload image:', imgErr);
        }
      }

      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update item:', err);
      alert('Failed to update item.');
    }
  }, [updateItem]);

  const handleCreateLocation = useCallback(async (data: { name: string; location_type: string; parent_id: string }) => {
    try {
      await createLocation({
        name: data.name,
        location_type: data.location_type as any,
        parent_id: data.parent_id || null,
        description: null,
        icon: 'map-pin',
        color: null,
        sort_order: 0,
      });
      setShowLocationModal(false);
    } catch (err) {
      console.error('Failed to create location:', err);
      alert('Failed to create location.');
    }
  }, [createLocation]);

  const handleCreateTag = useCallback(async (data: { name: string; color: string }) => {
    try {
      await createTag({
        name: data.name,
        color: data.color,
        description: null,
      });
      setShowTagModal(false);
    } catch (err) {
      console.error('Failed to create tag:', err);
      alert('Failed to create tag.');
    }
  }, [createTag]);

  // Create tag and return it for inline use
  const handleCreateTagInline = useCallback(async (data: { name: string; color: string }): Promise<{ id: string; name: string; color: string } | null> => {
    try {
      const newTag = await createTag({
        name: data.name,
        color: data.color,
        description: null,
      });
      return newTag ? { id: newTag.id, name: newTag.name, color: newTag.color } : null;
    } catch (err) {
      console.error('Failed to create tag:', err);
      return null;
    }
  }, [createTag]);

  const handleCreateCategory = useCallback(async (data: { name: string; icon: string; color: string; parent_id: string }) => {
    try {
      await createCategory({
        name: data.name,
        icon: data.icon,
        color: data.color,
        parent_id: data.parent_id || null,
        description: null,
        sort_order: 0,
      });
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category.');
    }
  }, [createCategory]);

  const handleUpdateCategory = useCallback(async (data: { id: string; name: string; icon: string; color: string; parent_id: string }) => {
    try {
      await updateCategory(data.id, {
        name: data.name,
        icon: data.icon,
        color: data.color,
        parent_id: data.parent_id || null,
      });
      setEditingCategory(null);
    } catch (err) {
      console.error('Failed to update category:', err);
      alert('Failed to update category.');
    }
  }, [updateCategory]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      await archiveItem(itemId);
      setShowDeleteConfirm(null);
      setShowItemMenu(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item.');
    }
  }, [archiveItem]);

  const handleDeleteLocation = useCallback(async (locationId: string) => {
    if (confirm('Delete this location?')) {
      try {
        await deleteLocation(locationId);
      } catch (err) {
        console.error('Failed to delete location:', err);
        alert('Cannot delete - may have items or children.');
      }
    }
  }, [deleteLocation]);

  const handleDeleteTag = useCallback(async (tagId: string) => {
    if (confirm('Delete this tag?')) {
      try {
        await deleteTag(tagId);
      } catch (err) {
        console.error('Failed to delete tag:', err);
        alert('Failed to delete tag.');
      }
    }
  }, [deleteTag]);

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    if (confirm('Delete this category?')) {
      try {
        await deleteCategory(categoryId);
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert('Cannot delete - may have items or subcategories.');
      }
    }
  }, [deleteCategory]);

  const handleExportCSV = useCallback(() => {
    const exportData = items.map(item => ({
      name: item.name,
      category: item.category?.name || '',
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      location: item.primary_location || '',
      price: item.purchase_price || '',
      is_essential: item.is_essential ? 'Yes' : 'No',
      updated_at: item.updated_at,
    }));
    exportToCSV(exportData, `inventory-${new Date().toISOString().split('T')[0]}`);
  }, [items]);

  // Item Card Component
  const ItemCard = useCallback(({ item, onEdit }: { item: ItemWithRelations; onEdit: (item: ItemWithRelations) => void }) => {
    // Check if expiring soon (within 30 days)
    const isExpiringSoon = item.expiration_date && new Date(item.expiration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isExpired = item.expiration_date && new Date(item.expiration_date) < new Date();
    
    // Determine border color based on item status
    const getBorderClass = () => {
      if (item.throw_away_soon) return 'border-red-400';
      if (item.needs_replacement) return 'border-orange-400';
      return borderColor;
    };
    
    // Get border style for non-default themes
    const getBorderStyle = () => {
      if (item.throw_away_soon || item.needs_replacement) return {};
      return borderColorStyle;
    };
    
    return (
      <div 
        className={`${bgCard} rounded-lg border ${getBorderClass()} overflow-hidden hover:shadow-lg transition-shadow relative`}
        style={{ ...bgCardStyle, ...getBorderStyle() }}
      >
        {/* Item Image */}
        {item.image_url ? (
          <div className="relative w-full h-32 bg-gray-100">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay for menu button */}
            <div className="absolute top-2 right-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowItemMenu(showItemMenu === item.id ? null : item.id); }}
                className="p-1 rounded bg-black/30 hover:bg-black/50 text-white"
              >
                <MoreVertical size={16} />
              </button>
              
              {showItemMenu === item.id && (
                <div className={`absolute right-0 mt-1 w-32 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-10 overflow-hidden`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(item); setShowItemMenu(null); }}
                    className={`w-full px-3 py-2 text-left text-sm ${textPrimary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} flex items-center gap-2`}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  {canDeleteItems && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); setShowItemMenu(null); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Favorite button on image */}
            <button 
              onClick={() => toggleFavorite(item.id)} 
              className="absolute top-2 left-2 p-1 rounded bg-black/30 hover:bg-black/50"
            >
              {item.is_favorite ? <Star size={18} className="text-yellow-400 fill-yellow-400" /> : <StarOff size={18} className="text-white" />}
            </button>
            {/* Status badges */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {item.needs_replacement && (
                <div className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                  <RefreshCw size={10} /> Replace
                </div>
              )}
              {item.throw_away_soon && (
                <div className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                  <Trash2 size={10} /> Toss
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowItemMenu(showItemMenu === item.id ? null : item.id); }}
              className={`p-1 rounded hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}
            >
              <MoreVertical size={16} className={textSecondary} />
            </button>
            
            {showItemMenu === item.id && (
              <div className={`absolute right-0 mt-1 w-32 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-10 overflow-hidden`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); setShowItemMenu(null); }}
                  className={`w-full px-3 py-2 text-left text-sm ${textPrimary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} flex items-center gap-2`}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); setShowItemMenu(null); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex justify-between items-start mb-2 pr-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold ${textPrimary}`}>{item.name}</h3>
                {item.is_essential && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>}
                {item.needs_replacement && !item.image_url && <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded flex items-center gap-0.5"><RefreshCw size={10} /> Replace</span>}
                {item.throw_away_soon && <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Trash2 size={10} /> Toss</span>}
              </div>
              <p className={`text-sm ${textSecondary}`}>{item.category?.name || 'Uncategorized'}</p>
            </div>
            {!item.image_url && (
              <button onClick={() => toggleFavorite(item.id)} className="p-1">
                {item.is_favorite ? <Star size={20} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={20} className={textSecondary} />}
              </button>
            )}
          </div>

          {/* Tags display */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.map(tag => (
                <span 
                  key={tag.id} 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: tag.color + '30', color: darkMode ? '#fff' : tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, -1)} className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center font-bold`}>-</button>
              <span className={`font-bold text-xl ${textPrimary} min-w-[60px] text-center`}>{item.quantity} <span className="text-sm font-normal">{item.unit}</span></span>
              <button onClick={() => updateQuantity(item.id, 1)} className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center font-bold`}>+</button>
            </div>
            <StatusBadge status={item.status} />
          </div>

          {item.min_threshold && item.status !== 'in_stock' && (
            <div className="flex items-center gap-1 text-yellow-600 text-sm mb-2">
              <AlertTriangle size={14} /><span>Below threshold ({item.min_threshold})</span>
            </div>
          )}

          {/* Expiration date warning */}
          {item.expiration_date && (
            <div className={`flex items-center gap-1 text-sm mb-2 ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : textSecondary}`}>
              <Calendar size={14} />
              <span>{isExpired ? 'Expired' : isExpiringSoon ? 'Expires' : 'Exp.'} {new Date(item.expiration_date).toLocaleDateString()}</span>
            </div>
          )}

          {/* Notes preview */}
          {item.notes && (
            <div className={`text-xs ${textSecondary} mb-2 line-clamp-2 italic`}>"{item.notes}"</div>
          )}

          <div className={`text-xs ${textSecondary} space-y-1`}>
            {item.primary_location && <div className="flex items-center gap-1"><MapPin size={12} /><span>{item.primary_location}</span></div>}
            <div className="flex items-center gap-1"><Clock size={12} /><span>Updated {formatRelativeTime(item.updated_at)}</span></div>
          </div>
        </div>
      </div>
    );
  }, [bgCard, bgCardStyle, borderColor, borderColorStyle, darkMode, textPrimary, textSecondary, showItemMenu, toggleFavorite, updateQuantity]);

  // Location Tree Component
  const LocationTree = useCallback(({ locs, level = 0 }: { locs: LocationWithChildren[]; level?: number }) => (
    <div className={level > 0 ? 'ml-4' : ''}>
      {locs.map(loc => (
        <div key={loc.id}>
          <div className={`flex items-center gap-2 py-2 px-2 rounded group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <div 
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={() => {
                if (loc.children && loc.children.length > 0) {
                  setExpandedLocations(prev => prev.includes(loc.id) ? prev.filter(id => id !== loc.id) : [...prev, loc.id]);
                }
              }}
            >
              {loc.children && loc.children.length > 0 ? (
                expandedLocations.includes(loc.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : <div className="w-4" />}
              <MapPin size={16} className={textSecondary} />
              <span className={textPrimary}>{loc.name}</span>
              <span className={`text-xs ${textSecondary}`}>({loc.location_type})</span>
            </div>
            <button onClick={() => handleDeleteLocation(loc.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition-opacity">
              <Trash2 size={14} />
            </button>
          </div>
          {loc.children && expandedLocations.includes(loc.id) && <LocationTree locs={loc.children} level={level + 1} />}
        </div>
      ))}
    </div>
  ), [darkMode, textPrimary, textSecondary, expandedLocations, handleDeleteLocation]);

  // Sidebar Component
  // Get app icon from localStorage
  const [appIcon, setAppIconState] = useState(localStorage.getItem('appIcon') || '📦');
  
  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAppIconState(localStorage.getItem('appIcon') || '📦');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Styled App Icon Component
  const AppIcon = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-lg',
      md: 'w-10 h-10 text-xl',
      lg: 'w-16 h-16 text-3xl'
    };
    
    const iconStyles: Record<string, React.CSSProperties> = {
      modern: {
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColorSecondary} 100%)`,
        borderRadius: '12px',
        boxShadow: `0 4px 12px ${accentColor}40`,
      },
      elegant: {
        background: `linear-gradient(180deg, ${accentColor}15 0%, ${accentColor}30 100%)`,
        border: `2px solid ${accentColor}`,
        borderRadius: '8px',
      },
      playful: {
        background: `linear-gradient(45deg, ${accentColor} 0%, ${accentColorSecondary} 50%, ${accentColor} 100%)`,
        borderRadius: '50%',
        boxShadow: `0 4px 16px ${accentColor}50`,
        animation: 'pulse 2s infinite',
      },
      bold: {
        background: accentColor,
        borderRadius: '4px',
        border: `3px solid ${darkMode ? '#fff' : '#000'}`,
        boxShadow: `4px 4px 0 ${darkMode ? '#fff' : '#000'}`,
      },
      soft: {
        background: `${accentColor}20`,
        borderRadius: '16px',
        border: `1px solid ${accentColor}40`,
      },
    };

    const style = iconStyles[theme.iconStyle] || iconStyles.modern;

    return (
      <div 
        className={`${sizeClasses[size]} flex items-center justify-center transition-all duration-300`}
        style={style}
      >
        <span className={theme.iconStyle === 'elegant' || theme.iconStyle === 'soft' ? '' : 'drop-shadow-sm'}>
          {appIcon}
        </span>
      </div>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    const sidebarBg = !isDefaultTheme 
      ? { backgroundColor: themeColors.sidebar }
      : {};
    const sidebarTextColor = !isDefaultTheme ? '#fff' : '';
    
    return (
      <div 
        className={`${mobile ? 'w-full' : 'w-56'} ${isDefaultTheme ? bgCard : ''} h-full flex flex-col border-r ${isDefaultTheme ? borderColor : ''}`}
        style={{ ...sidebarBg, borderColor: !isDefaultTheme ? themeColors.border : '' }}
      >
        <div className={`p-4 border-b flex items-center justify-between`} style={{ borderColor: !isDefaultTheme ? 'rgba(255,255,255,0.2)' : '' }}>
          <div className="flex items-center gap-2">
            <AppIcon size="sm" />
            <span 
              className={`font-bold text-lg ${isDefaultTheme ? textPrimary : ''}`}
              style={{ color: sidebarTextColor, fontFamily: theme.fontFamily }}
            >
              Inventorois
            </span>
          </div>
          {mobile && <button onClick={() => setMobileSidebarOpen(false)}><X size={24} style={{ color: sidebarTextColor || (darkMode ? '#fff' : '#000') }} /></button>}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); if (mobile) setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm`}
                style={{
                  backgroundColor: isActive 
                    ? accentColor 
                    : 'transparent',
                  color: isActive 
                    ? '#fff' 
                    : (sidebarTextColor || (darkMode ? '#9CA3AF' : '#6B7280')),
                }}
              >
                <item.icon size={18} /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: !isDefaultTheme ? 'rgba(255,255,255,0.2)' : '' }}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div 
              className="p-2 rounded text-center"
              style={{ backgroundColor: !isDefaultTheme ? 'rgba(255,255,255,0.1)' : (darkMode ? '#374151' : '#F3F4F6') }}
            >
              <div className="text-lg font-bold" style={{ color: sidebarTextColor || (darkMode ? '#fff' : '#111827') }}>{items.length}</div>
              <div className="text-xs" style={{ color: sidebarTextColor ? 'rgba(255,255,255,0.7)' : (darkMode ? '#9CA3AF' : '#6B7280') }}>Items</div>
            </div>
            <div 
              className="p-2 rounded text-center"
              style={{ backgroundColor: !isDefaultTheme ? 'rgba(255,255,255,0.1)' : (darkMode ? '#374151' : '#F3F4F6') }}
            >
              <div className="text-lg font-bold" style={{ color: accentColorSecondary }}>{items.filter(i => i.status === 'low_stock').length}</div>
              <div className="text-xs" style={{ color: sidebarTextColor ? 'rgba(255,255,255,0.7)' : (darkMode ? '#9CA3AF' : '#6B7280') }}>Low</div>
            </div>
          </div>
          <button 
            onClick={() => signOut()} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ color: sidebarTextColor ? 'rgba(255,255,255,0.7)' : (darkMode ? '#9CA3AF' : '#6B7280') }}
          >
            <LogOut size={16} /><span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // PAGE COMPONENTS
  // ============================================

  const Dashboard = () => {
    const alertItems = items.filter(i => i.status === 'out_of_stock' || (i.is_essential && i.status === 'low_stock'));
    const favoriteItems = items.filter(i => i.is_favorite);
    const recentItems = [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

    return (
      <div className="space-y-6">
        {alertItems.length > 0 && (
          <div className={`${darkMode ? 'bg-red-900/30' : 'bg-red-50'} border border-red-200 rounded-lg p-4`}>
            <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-3"><AlertTriangle size={20} /> Attention Needed</h3>
            <div className="space-y-2">
              {alertItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <span style={{ color: themeColors.text }}>{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`} style={{ ...bgCardStyle, ...borderColorStyle }}><div className={`text-2xl font-bold`} style={{ color: themeColors.text }}>{items.length}</div><div style={{ color: themeColors.textSecondary }}>Total Items</div></div>
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`} style={{ ...bgCardStyle, ...borderColorStyle }}><div className="text-2xl font-bold text-green-500">{items.filter(i => i.status === 'in_stock').length}</div><div style={{ color: themeColors.textSecondary }}>In Stock</div></div>
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`} style={{ ...bgCardStyle, ...borderColorStyle }}><div className="text-2xl font-bold text-yellow-500">{items.filter(i => i.status === 'low_stock').length}</div><div style={{ color: themeColors.textSecondary }}>Low Stock</div></div>
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`} style={{ ...bgCardStyle, ...borderColorStyle }}><div className="text-2xl font-bold text-red-500">{items.filter(i => i.status === 'out_of_stock').length}</div><div style={{ color: themeColors.textSecondary }}>Out of Stock</div></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={`${bgCard} rounded-lg border ${borderColor} p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2`} style={{ color: themeColors.text }}><Clock size={18} /> Recently Updated</h3>
            <div className="space-y-2">
              {recentItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-2 rounded`} style={{ backgroundColor: themeColors.highlight }}>
                  <div><div style={{ color: themeColors.text }}>{item.name}</div><div className="text-xs" style={{ color: themeColors.textSecondary }}>{formatRelativeTime(item.updated_at)}</div></div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
              {recentItems.length === 0 && <p className="text-sm" style={{ color: themeColors.textSecondary }}>No items yet</p>}
            </div>
          </div>

          <div className={`${bgCard} rounded-lg border ${borderColor} p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2`} style={{ color: themeColors.text }}><Star size={18} className="text-yellow-500" /> Favorites</h3>
            <div className="space-y-2">
              {favoriteItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-2 rounded`} style={{ backgroundColor: themeColors.highlight }}>
                  <div><div style={{ color: themeColors.text }}>{item.name}</div><div className="text-xs" style={{ color: themeColors.textSecondary }}>{item.primary_location}</div></div>
                  <div className="flex items-center gap-2"><span className="font-medium" style={{ color: themeColors.text }}>{item.quantity} {item.unit}</span><StatusBadge status={item.status} /></div>
                </div>
              ))}
              {favoriteItems.length === 0 && <p className="text-sm" style={{ color: themeColors.textSecondary }}>No favorites yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter items based on search and filters (location filtering now happens at database level)
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Category filter
    if (filterCategory && item.category_id !== filterCategory) return false;
    // Status filter
    if (filterStatus && item.status !== filterStatus) return false;
    // Essential filter
    if (filterEssential && !item.is_essential) return false;
    return true;
  });

  // Group items by location for "by location" view
  const itemsByLocation = filteredItems.reduce((acc, item) => {
    const locationId = item.locations?.find(l => l.is_primary)?.location_id || 'no-location';
    const locationName = item.primary_location || 'No Location';
    if (!acc[locationId]) {
      acc[locationId] = { name: locationName, items: [] };
    }
    acc[locationId].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: typeof items }>);

  // Inventory page content (rendered inline to prevent input focus loss)
  const inventoryContent = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className={`flex-1 flex items-center gap-2 ${bgCard} border ${borderColor} rounded-lg px-3 py-2`} style={{ ...bgCardStyle, ...borderColorStyle }}>
            <Search size={18} style={{ color: themeColors.textSecondary }} />
            <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: themeColors.text }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ color: themeColors.textSecondary }}><X size={16} /></button>}
          </div>
          <button onClick={toggleFilters} className={`p-2 rounded-lg border ${borderColor} ${bgCard} ${showFilters ? 'ring-2 ring-blue-500' : ''}`} style={{ ...bgCardStyle, ...borderColorStyle }}><Filter size={18} style={{ color: themeColors.textSecondary }} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className={`p-2 rounded-lg border ${borderColor} ${bgCard}`} style={{ ...bgCardStyle, ...borderColorStyle }} title="Export CSV"><Download size={18} style={{ color: themeColors.textSecondary }} /></button>
          <div className={`flex rounded-lg border ${borderColor} overflow-hidden`} style={borderColorStyle}>
            <button onClick={() => { setViewMode('grid'); setInventoryViewMode('all'); }} className={`p-2 ${viewMode === 'grid' && inventoryViewMode === 'all' ? 'bg-blue-500 text-white' : bgCard}`} style={viewMode === 'grid' && inventoryViewMode === 'all' ? {} : bgCardStyle} title="Grid View"><Grid size={18} /></button>
            <button onClick={() => { setViewMode('list'); setInventoryViewMode('all'); }} className={`p-2 ${viewMode === 'list' && inventoryViewMode === 'all' ? 'bg-blue-500 text-white' : bgCard}`} style={viewMode === 'list' && inventoryViewMode === 'all' ? {} : bgCardStyle} title="List View"><List size={18} /></button>
            <button onClick={() => setInventoryViewMode('byLocation')} className={`p-2 ${inventoryViewMode === 'byLocation' ? 'bg-blue-500 text-white' : bgCard}`} style={inventoryViewMode === 'byLocation' ? {} : bgCardStyle} title="By Location"><MapPin size={18} /></button>
          </div>
          <button
            onClick={() => { setItemFormInitialData(null); openAddModal(); }}
            disabled={!canAddItems}
            className={`flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ${!canAddItems ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!canAddItems ? 'Viewers cannot add items' : 'Add Item'}
          >
            <Plus size={18} /><span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm block mb-1" style={{ color: themeColors.textSecondary }}>Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`w-full p-2 rounded border ${borderColor}`} style={{ ...inputBgStyle, ...borderColorStyle }}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm block mb-1" style={{ color: themeColors.textSecondary }}>Location</label>
              <select value={filters.location_id || ''} onChange={(e) => setFilter('location_id', e.target.value || undefined)} className={`w-full p-2 rounded border ${borderColor}`} style={{ ...inputBgStyle, ...borderColorStyle }}>
                <option value="">All Locations</option>
                {locationOptions.map(loc => <option key={loc.id} value={loc.id}>{loc.path}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm block mb-1" style={{ color: themeColors.textSecondary }}>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`w-full p-2 rounded border ${borderColor}`} style={{ ...inputBgStyle, ...borderColorStyle }}>
                <option value="">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm" style={{ color: themeColors.text }}><input type="checkbox" checked={filterEssential} onChange={(e) => setFilterEssential(e.target.checked)} />Essentials Only</label>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setFilterCategory(''); setFilter('location_id', undefined); setFilterStatus(''); setFilterEssential(false); setSearchQuery(''); }} className="text-sm text-blue-500 hover:underline">Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(searchQuery || filterCategory || filters.location_id || filterStatus || filterEssential) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm" style={{ color: themeColors.textSecondary }}>Showing {filteredItems.length} of {items.length} items:</span>
          {searchQuery && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">Search: "{searchQuery}" <button onClick={() => setSearchQuery('')}><X size={12} /></button></span>}
          {filterCategory && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">{categories.find(c => c.id === filterCategory)?.name} <button onClick={() => setFilterCategory('')}><X size={12} /></button></span>}
          {filters.location_id && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">{locationOptions.find(l => l.id === filters.location_id)?.path} <button onClick={() => setFilter('location_id', undefined)}><X size={12} /></button></span>}
          {filterStatus && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">{filterStatus.replace('_', ' ')} <button onClick={() => setFilterStatus('')}><X size={12} /></button></span>}
          {filterEssential && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">Essential <button onClick={() => setFilterEssential(false)}><X size={12} /></button></span>}
        </div>
      )}

      {itemsLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
      ) : filteredItems.length === 0 ? (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-12 text-center`}>
          <Package size={48} className={`mx-auto mb-4 ${textSecondary}`} />
          <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>{items.length === 0 ? 'No items yet' : 'No items match your filters'}</h3>
          <p className={`${textSecondary} mb-4`}>{items.length === 0 ? 'Start building your inventory.' : 'Try adjusting your filters.'}</p>
          {items.length === 0 && <button onClick={() => { setItemFormInitialData(null); openAddModal(); }} className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><Plus size={18} /> Add Your First Item</button>}
        </div>
      ) : inventoryViewMode === 'byLocation' ? (
        // View by location
        <div className="space-y-6">
          {Object.entries(itemsByLocation).map(([locationId, { name: locName, items: locItems }]) => (
            <div key={locationId} className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
              <div className={`px-4 py-3 border-b ${borderColor} flex items-center gap-2`}>
                <MapPin size={18} className={textSecondary} />
                <h3 className={`font-semibold ${textPrimary}`}>{locName}</h3>
                <span className={`text-sm ${textSecondary}`}>({locItems.length} items)</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {locItems.map(item => (
                  <div key={item.id} className={`border ${borderColor} rounded-lg p-3 hover:shadow-md transition-shadow`}>
                    <div className="flex items-start gap-3">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${textPrimary} truncate`}>{item.name}</span>
                          {item.is_essential && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>}
                        </div>
                        <div className={`text-sm ${textSecondary}`}>{item.category?.name || 'Uncategorized'}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-sm font-bold`}>-</button>
                          <span className={`font-medium ${textPrimary}`}>{item.quantity} {item.unit}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-sm font-bold`}>+</button>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <button onClick={() => handleEditItem(item)} className={`p-1 ${textSecondary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} rounded`}><Edit2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
          {filteredItems.map(item => viewMode === 'grid' ? <ItemCard key={item.id} item={item} onEdit={handleEditItem} /> : (
            <div key={item.id} className={`${bgCard} border ${borderColor} rounded-lg p-3 flex items-center gap-4`}>
              <button onClick={() => toggleFavorite(item.id)}>{item.is_favorite ? <Star size={18} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={18} className={textSecondary} />}</button>
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className={`font-medium ${textPrimary}`}>{item.name}</span>{item.is_essential && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>}</div>
                <div className={`text-sm ${textSecondary}`}>{item.category?.name || 'Uncategorized'}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-sm font-bold`}>-</button>
                  <span className={`font-medium ${textPrimary} w-16 text-center`}>{item.quantity} {item.unit}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-sm font-bold`}>+</button>
                </div>
                <StatusBadge status={item.status} />
                <button onClick={() => handleEditItem(item)} className={`p-1 ${textSecondary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} rounded`}><Edit2 size={16} /></button>
                <button onClick={() => setShowDeleteConfirm(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const CategoriesPage = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Categories</h2>
        {canManageStructure && (
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className={`${bgCard} border ${borderColor} rounded-lg p-4 group`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '20' }}>{cat.icon}</div>
              <div className="flex-1"><h3 className={`font-semibold ${textPrimary}`}>{cat.name}</h3><p className={`text-sm ${textSecondary}`}>{cat.item_count || 0} items</p></div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, parent_id: cat.parent_id })} className={`p-1 ${textSecondary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} rounded`}><Edit2 size={16} /></button>
                {!cat.is_system && <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16} /></button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LocationsPage = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Locations</h2>
        {canManageStructure && (
          <button onClick={() => setShowLocationModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus size={18} /> Add Location
          </button>
        )}
      </div>
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        {locations.length > 0 ? <LocationTree locs={locations} /> : (
          <div className="text-center py-8"><MapPin size={48} className={`mx-auto mb-4 ${textSecondary}`} /><p className={textSecondary}>No locations yet.</p></div>
        )}
      </div>
    </div>
  );

  const TagsPage = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Tags</h2>
        {canManageStructure && (
          <button onClick={() => setShowTagModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus size={18} /> Add Tag
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag.id} className={`${bgCard} border ${borderColor} rounded-lg p-3 flex items-center gap-3 group`}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className={textPrimary}>{tag.name}</span>
            <span className={`text-sm ${textSecondary}`}>({tag.count || 0})</span>
            <button onClick={() => handleDeleteTag(tag.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
        {tags.length === 0 && <div className={`${bgCard} border ${borderColor} rounded-lg p-8 w-full text-center`}><Tags size={48} className={`mx-auto mb-4 ${textSecondary}`} /><p className={textSecondary}>No tags yet.</p></div>}
      </div>
    </div>
  );

  const TemplatesPage = () => {
    const [showCreateTemplate, setShowCreateTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateUnit, setNewTemplateUnit] = useState('units');
    const [newTemplateThreshold, setNewTemplateThreshold] = useState('');
    const [newTemplateEssential, setNewTemplateEssential] = useState(false);
    const [newTemplateCategory, setNewTemplateCategory] = useState('');
    const [newTemplateLocation, setNewTemplateLocation] = useState('');
    const [newTemplateTags, setNewTemplateTags] = useState<string[]>([]);
    const [newTemplatePrice, setNewTemplatePrice] = useState('');
    const [newTemplateNeedsReplacement, setNewTemplateNeedsReplacement] = useState(false);
    const [newTemplateThrowAway, setNewTemplateThrowAway] = useState(false);

    const resetForm = () => {
      setNewTemplateName('');
      setNewTemplateUnit('units');
      setNewTemplateThreshold('');
      setNewTemplateEssential(false);
      setNewTemplateCategory('');
      setNewTemplateLocation('');
      setNewTemplateTags([]);
      setNewTemplatePrice('');
      setNewTemplateNeedsReplacement(false);
      setNewTemplateThrowAway(false);
      setShowCreateTemplate(false);
    };

    const handleCreateTemplate = async () => {
      if (!newTemplateName.trim()) return;
      try {
        await createTemplate({
          name: newTemplateName.trim(),
          description: null,
          template_data: {
            unit: newTemplateUnit,
            min_threshold: newTemplateThreshold ? parseInt(newTemplateThreshold) : undefined,
            is_essential: newTemplateEssential,
            category_id: newTemplateCategory || undefined,
            location_id: newTemplateLocation || undefined,
            tag_ids: newTemplateTags.length > 0 ? newTemplateTags : undefined,
            purchase_price: newTemplatePrice ? parseFloat(newTemplatePrice) : undefined,
            needs_replacement: newTemplateNeedsReplacement,
            throw_away_soon: newTemplateThrowAway,
          },
          category_id: newTemplateCategory || null,
          is_system: false,
          use_count: 0,
        });
        resetForm();
      } catch (err) {
        console.error('Failed to create template:', err);
        alert('Failed to create template.');
      }
    };

    const handleDeleteTemplate = async (id: string) => {
      if (confirm('Delete this template?')) {
        try {
          await deleteTemplate(id);
        } catch (err) {
          console.error('Failed to delete template:', err);
        }
      }
    };

    const getCategoryName = (catId: string | undefined) => {
      if (!catId) return null;
      return categories.find(c => c.id === catId)?.name;
    };

    const getLocationName = (locId: string | undefined) => {
      if (!locId) return null;
      return locationOptions.find(l => l.id === locId)?.path;
    };

    const getTagNames = (tagIds: string[] | undefined) => {
      if (!tagIds || tagIds.length === 0) return [];
      return tags.filter(t => tagIds.includes(t.id));
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Item Templates</h2>
            <p className={`text-sm ${textSecondary}`}>Save common item configurations for quick reuse</p>
          </div>
          <button onClick={() => setShowCreateTemplate(!showCreateTemplate)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus size={18} /> Create Template
          </button>
        </div>

        {showCreateTemplate && (
          <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
            <h3 className={`font-medium ${textPrimary} mb-4`}>New Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={`text-sm ${textSecondary} block mb-1`}>Template Name *</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Cleaning Supplies"
                  className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-sm ${textSecondary} block mb-1`}>Default Unit</label>
                <select value={newTemplateUnit} onChange={(e) => setNewTemplateUnit(e.target.value)} className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}>
                  <option value="units">units</option>
                  <option value="pcs">pcs</option>
                  <option value="rolls">rolls</option>
                  <option value="bottles">bottles</option>
                  <option value="boxes">boxes</option>
                  <option value="bags">bags</option>
                  <option value="cans">cans</option>
                  <option value="lbs">lbs</option>
                  <option value="oz">oz</option>
                  <option value="pairs">pairs</option>
                </select>
              </div>
              <div>
                <label className={`text-sm ${textSecondary} block mb-1`}>Min Threshold</label>
                <input
                  type="number"
                  value={newTemplateThreshold}
                  onChange={(e) => setNewTemplateThreshold(e.target.value)}
                  placeholder="Alert when below"
                  className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-sm ${textSecondary} block mb-1`}>Default Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTemplatePrice}
                  onChange={(e) => setNewTemplatePrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
                />
              </div>
              <div>
                <label className={`text-sm ${textSecondary} block mb-1`}>Category</label>
                <select value={newTemplateCategory} onChange={(e) => setNewTemplateCategory(e.target.value)} className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}>
                  <option value="">No default category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`text-sm ${textSecondary} block mb-1`}>Location</label>
                <select value={newTemplateLocation} onChange={(e) => setNewTemplateLocation(e.target.value)} className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}>
                  <option value="">No default location</option>
                  {locationOptions.map(loc => <option key={loc.id} value={loc.id}>{loc.path}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={`text-sm ${textSecondary} block mb-1`}>Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (newTemplateTags.includes(tag.id)) {
                          setNewTemplateTags(newTemplateTags.filter(t => t !== tag.id));
                        } else {
                          setNewTemplateTags([...newTemplateTags, tag.id]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newTemplateTags.includes(tag.id)
                          ? 'ring-2 ring-offset-1'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: tag.color + '30', 
                        color: darkMode ? '#fff' : tag.color,
                        borderColor: tag.color
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && <span className={`text-sm ${textSecondary}`}>No tags available</span>}
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-4">
                <label className={`flex items-center gap-2 ${textPrimary} text-sm cursor-pointer`}>
                  <input type="checkbox" checked={newTemplateEssential} onChange={(e) => setNewTemplateEssential(e.target.checked)} className="w-4 h-4 rounded" />
                  Essential
                </label>
                <label className={`flex items-center gap-2 text-orange-500 text-sm cursor-pointer`}>
                  <input type="checkbox" checked={newTemplateNeedsReplacement} onChange={(e) => setNewTemplateNeedsReplacement(e.target.checked)} className="w-4 h-4 rounded" />
                  Needs Replacement
                </label>
                <label className={`flex items-center gap-2 text-red-500 text-sm cursor-pointer`}>
                  <input type="checkbox" checked={newTemplateThrowAway} onChange={(e) => setNewTemplateThrowAway(e.target.checked)} className="w-4 h-4 rounded" />
                  Throw Away Soon
                </label>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2 border-t border-gray-200">
                <button onClick={resetForm} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
                  Cancel
                </button>
                <button onClick={handleCreateTemplate} disabled={!newTemplateName.trim()} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {templates.length === 0 ? (
          <div className={`${bgCard} border ${borderColor} rounded-lg p-12 text-center`}>
            <FileText size={48} className={`mx-auto mb-4 ${textSecondary}`} />
            <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No templates yet</h3>
            <p className={`${textSecondary} mb-4`}>Create templates for items you add frequently to save time.</p>
            <button onClick={() => setShowCreateTemplate(true)} className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              <Plus size={18} /> Create Your First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.filter(t => !t.is_system).map(template => {
              const templateTags = getTagNames(template.template_data.tag_ids);
              return (
                <div key={template.id} className={`${bgCard} border ${borderColor} rounded-lg p-4 group`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${textPrimary}`}>{template.name}</h3>
                    <button onClick={() => handleDeleteTemplate(template.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className={`text-sm ${textSecondary} space-y-1 mb-3`}>
                    <div className="flex items-center gap-2">
                      <span>Unit: {template.template_data.unit || 'units'}</span>
                      {template.template_data.min_threshold && <span>• Min: {template.template_data.min_threshold}</span>}
                    </div>
                    {template.template_data.purchase_price && <div>Price: ${template.template_data.purchase_price}</div>}
                    {getCategoryName(template.template_data.category_id) && (
                      <div className="flex items-center gap-1">
                        <span>📁</span>
                        <span>{getCategoryName(template.template_data.category_id)}</span>
                      </div>
                    )}
                    {getLocationName(template.template_data.location_id) && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="truncate">{getLocationName(template.template_data.location_id)}</span>
                      </div>
                    )}
                    {templateTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {templateTags.map(tag => (
                          <span key={tag.id} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: tag.color + '30', color: darkMode ? '#fff' : tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {template.template_data.is_essential && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>}
                      {template.template_data.needs_replacement && <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">Replace</span>}
                      {template.template_data.throw_away_soon && <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Toss</span>}
                    </div>
                    <div className={`text-xs ${textSecondary}`}>Used {template.use_count || 0} times</div>
                  </div>
                  <button
                    onClick={() => {
                      useTemplate(template.id);
                      setItemFormInitialData({
                        name: '',
                        unit: template.template_data.unit || 'units',
                        min_threshold: template.template_data.min_threshold?.toString() || '',
                        is_essential: template.template_data.is_essential || false,
                        category_id: template.template_data.category_id || '',
                        location_id: template.template_data.location_id || '',
                        tag_ids: template.template_data.tag_ids || [],
                        purchase_price: template.template_data.purchase_price?.toString() || '',
                        needs_replacement: template.template_data.needs_replacement || false,
                        throw_away_soon: template.template_data.throw_away_soon || false,
                      });
                      openAddModal();
                    }}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Use Template
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const HistoryPage = () => (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Change History</h2>
      <div className={`${bgCard} border ${borderColor} rounded-lg divide-y ${borderColor}`}>
        {history.map((change) => (
          <div key={change.id} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${change.action === 'create' ? 'bg-green-100 text-green-600' : change.action === 'delete' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {change.action === 'create' ? <Plus size={18} /> : change.action === 'delete' ? <Trash2 size={18} /> : <Edit2 size={18} />}
            </div>
            <div className="flex-1">
              <div className={textPrimary}><span className="font-medium">{change.entity_name}</span>{change.action === 'update' && change.field_name && <span className={textSecondary}> - {change.field_name}: {change.old_value} → {change.new_value}</span>}{change.action === 'create' && <span className={textSecondary}> was created</span>}{change.action === 'delete' && <span className={textSecondary}> was deleted</span>}</div>
              <div className={`text-sm ${textSecondary}`}>{formatRelativeTime(change.changed_at)}</div>
            </div>
            {!change.is_undone && change.action === 'update' && <button onClick={() => undoChange(change.id)} className="text-blue-500 p-2"><Undo2 size={16} /></button>}
          </div>
        ))}
        {history.length === 0 && <p className={`p-4 ${textSecondary}`}>No changes recorded yet.</p>}
      </div>
    </div>
  );

  // ============================================
  // ANALYSIS PAGE
  // ============================================
  const AnalysisPage = () => {
    // State for expanded sections
    const [showAllEssentials, setShowAllEssentials] = useState(false);
    const [showAllExpiring, setShowAllExpiring] = useState(false);
    const [showAllReplacement, setShowAllReplacement] = useState(false);
    const [showAllThrowAway, setShowAllThrowAway] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllLocations, setShowAllLocations] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemWithRelations | null>(null);
    const [viewMode, setAnalysisViewMode] = useState<'cards' | 'charts'>('cards');

    // Calculate various analytics
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.purchase_price || 0)), 0);
    
    const lowStockItems = items.filter(item => item.status === 'low_stock');
    const outOfStockItems = items.filter(item => item.status === 'out_of_stock');
    const inStockItems = items.filter(item => item.status === 'in_stock');
    const essentialItems = items.filter(item => item.is_essential);
    const essentialLowStock = essentialItems.filter(item => item.status !== 'in_stock');
    
    // Items expiring soon (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringItems = items.filter(item => {
      if (!item.expiration_date) return false;
      const expDate = new Date(item.expiration_date);
      return expDate <= thirtyDaysFromNow && expDate >= today;
    });
    
    // Items needing replacement
    const replacementItems = items.filter(item => item.needs_replacement);
    
    // Items to throw away soon
    const throwAwayItems = items.filter(item => item.throw_away_soon);
    
    // Category breakdown
    const categoryBreakdown = categories.map(cat => ({
      ...cat,
      itemCount: items.filter(item => item.category_id === cat.id).length,
      totalValue: items.filter(item => item.category_id === cat.id).reduce((sum, item) => sum + (item.quantity * (item.purchase_price || 0)), 0)
    })).filter(cat => cat.itemCount > 0).sort((a, b) => b.itemCount - a.itemCount);
    
    // Location breakdown
    const locationBreakdown = locationOptions.map(loc => {
      const locItems = items.filter(item => item.locations?.some(l => l.location_id === loc.id));
      return {
        ...loc,
        itemCount: locItems.length,
        totalValue: locItems.reduce((sum, item) => sum + (item.quantity * (item.purchase_price || 0)), 0)
      };
    }).filter(loc => loc.itemCount > 0).sort((a, b) => b.itemCount - a.itemCount);

    // Status distribution for chart
    const statusData = [
      { label: 'In Stock', count: inStockItems.length, color: '#22C55E' },
      { label: 'Low Stock', count: lowStockItems.length, color: '#EAB308' },
      { label: 'Out of Stock', count: outOfStockItems.length, color: '#EF4444' },
    ];

    // Simple bar chart component
    const BarChart = ({ data, maxWidth = 200 }: { data: { label: string; count: number; color: string }[]; maxWidth?: number }) => {
      const maxCount = Math.max(...data.map(d => d.count), 1);
      return (
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`text-xs ${textSecondary} w-20 truncate`}>{item.label}</span>
              <div className="flex-1 h-6 rounded overflow-hidden" style={{ backgroundColor: darkMode ? '#374151' : '#E5E7EB', maxWidth }}>
                <div 
                  className="h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${(item.count / maxCount) * 100}%`, backgroundColor: item.color, minWidth: item.count > 0 ? '30px' : '0' }}
                >
                  <span className="text-xs text-white font-medium">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // Item detail modal
    const ItemDetailModal = () => {
      if (!selectedItem) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedItem(null)}>
          <div className={`${bgCard} rounded-xl shadow-xl max-w-md w-full p-6`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>{selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)} className={textSecondary}><X size={20} /></button>
            </div>
            {selectedItem.image_url && <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-40 object-cover rounded-lg mb-4" />}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className={textSecondary}>Category:</span><span className={textPrimary}>{selectedItem.category?.name || 'Uncategorized'}</span></div>
              <div className="flex justify-between"><span className={textSecondary}>Quantity:</span><span className={textPrimary}>{selectedItem.quantity} {selectedItem.unit}</span></div>
              <div className="flex justify-between"><span className={textSecondary}>Status:</span><StatusBadge status={selectedItem.status} /></div>
              {selectedItem.purchase_price && <div className="flex justify-between"><span className={textSecondary}>Price:</span><span className={textPrimary}>${selectedItem.purchase_price}</span></div>}
              {selectedItem.primary_location && <div className="flex justify-between"><span className={textSecondary}>Location:</span><span className={textPrimary}>{selectedItem.primary_location}</span></div>}
              {selectedItem.expiration_date && <div className="flex justify-between"><span className={textSecondary}>Expires:</span><span className={textPrimary}>{new Date(selectedItem.expiration_date).toLocaleDateString()}</span></div>}
              {selectedItem.acquired_date && <div className="flex justify-between"><span className={textSecondary}>Purchased:</span><span className={textPrimary}>{new Date(selectedItem.acquired_date).toLocaleDateString()}</span></div>}
              {selectedItem.notes && <div className="pt-2 border-t"><span className={textSecondary}>Notes:</span><p className={`${textPrimary} mt-1`}>{selectedItem.notes}</p></div>}
            </div>
            <button onClick={() => { handleEditItem(selectedItem); setSelectedItem(null); }} className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Edit Item</button>
          </div>
        </div>
      );
    };

    // Clickable item row component
    const ItemRow = ({ item, showDate = false }: { item: ItemWithRelations; showDate?: boolean }) => (
      <div 
        key={item.id} 
        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:ring-2 ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {item.image_url && <img src={item.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
          <span className={`${textPrimary} truncate text-sm`}>{item.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {showDate && item.expiration_date && <span className="text-xs text-orange-500">{new Date(item.expiration_date).toLocaleDateString()}</span>}
          {!showDate && <span className={`text-xs ${item.status === 'out_of_stock' ? 'text-red-500' : 'text-yellow-500'}`}>{item.quantity} {item.unit}</span>}
          <StatusBadge status={item.status} />
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className={`text-lg sm:text-xl font-semibold ${textPrimary}`}>Inventory Analysis</h2>
          <div className={`flex rounded-lg border ${borderColor} overflow-hidden`}>
            <button onClick={() => setAnalysisViewMode('cards')} className={`px-3 py-1.5 text-sm ${viewMode === 'cards' ? 'bg-blue-500 text-white' : bgCard}`}>Cards</button>
            <button onClick={() => setAnalysisViewMode('charts')} className={`px-3 py-1.5 text-sm ${viewMode === 'charts' ? 'bg-blue-500 text-white' : bgCard}`}>Charts</button>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><Package size={16} className="text-blue-600" /></div>
              <div className="min-w-0"><div className={`text-lg sm:text-xl font-bold ${textPrimary} truncate`}>{totalItems}</div><div className={`text-xs ${textSecondary}`}>Items</div></div>
            </div>
          </div>
          <div className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><DollarSign size={16} className="text-green-600" /></div>
              <div className="min-w-0"><div className={`text-lg sm:text-xl font-bold ${textPrimary} truncate`}>${totalValue.toFixed(0)}</div><div className={`text-xs ${textSecondary}`}>Value</div></div>
            </div>
          </div>
          <div className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0"><TrendingDown size={16} className="text-yellow-600" /></div>
              <div className="min-w-0"><div className={`text-lg sm:text-xl font-bold ${textPrimary}`}>{lowStockItems.length}</div><div className={`text-xs ${textSecondary}`}>Low Stock</div></div>
            </div>
          </div>
          <div className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><AlertCircle size={16} className="text-red-600" /></div>
              <div className="min-w-0"><div className={`text-lg sm:text-xl font-bold ${textPrimary}`}>{outOfStockItems.length}</div><div className={`text-xs ${textSecondary}`}>Out</div></div>
            </div>
          </div>
        </div>

        {viewMode === 'charts' ? (
          /* Charts View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <h3 className={`font-semibold ${textPrimary} mb-4 text-sm sm:text-base`}>Stock Status Distribution</h3>
              <BarChart data={statusData} maxWidth={300} />
            </div>
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <h3 className={`font-semibold ${textPrimary} mb-4 text-sm sm:text-base`}>Top Categories</h3>
              <BarChart data={categoryBreakdown.slice(0, 5).map(cat => ({ label: cat.name, count: cat.itemCount, color: cat.color || '#3B82F6' }))} maxWidth={300} />
            </div>
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <h3 className={`font-semibold ${textPrimary} mb-4 text-sm sm:text-base`}>Value by Category</h3>
              <BarChart data={categoryBreakdown.slice(0, 5).map(cat => ({ label: cat.name, count: Math.round(cat.totalValue), color: cat.color || '#22C55E' }))} maxWidth={300} />
            </div>
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <h3 className={`font-semibold ${textPrimary} mb-4 text-sm sm:text-base`}>Items by Location</h3>
              <BarChart data={locationBreakdown.slice(0, 5).map(loc => ({ label: loc.name, count: loc.itemCount, color: '#8B5CF6' }))} maxWidth={300} />
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Essential Items Low/Out */}
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 text-sm sm:text-base`}><AlertTriangle size={16} className="text-yellow-500" /> Essentials Alert</h3>
                {essentialLowStock.length > 5 && (
                  <button onClick={() => setShowAllEssentials(!showAllEssentials)} className="text-xs text-blue-500 hover:underline">
                    {showAllEssentials ? 'Show Less' : `Show All (${essentialLowStock.length})`}
                  </button>
                )}
              </div>
              {essentialLowStock.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(showAllEssentials ? essentialLowStock : essentialLowStock.slice(0, 5)).map(item => <ItemRow key={item.id} item={item} />)}
                </div>
              ) : (
                <p className={`${textSecondary} text-sm`}>All essential items are in stock! ✓</p>
              )}
            </div>

            {/* Expiring Soon */}
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 text-sm sm:text-base`}><Calendar size={16} className="text-orange-500" /> Expiring Soon</h3>
                {expiringItems.length > 5 && (
                  <button onClick={() => setShowAllExpiring(!showAllExpiring)} className="text-xs text-blue-500 hover:underline">
                    {showAllExpiring ? 'Show Less' : `Show All (${expiringItems.length})`}
                  </button>
                )}
              </div>
              {expiringItems.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(showAllExpiring ? expiringItems : expiringItems.slice(0, 5)).map(item => <ItemRow key={item.id} item={item} showDate />)}
                </div>
              ) : (
                <p className={`${textSecondary} text-sm`}>No items expiring soon.</p>
              )}
            </div>

            {/* Needs Replacement */}
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 text-sm sm:text-base`}><RefreshCw size={16} className="text-orange-500" /> Needs Replacement</h3>
                {replacementItems.length > 5 && (
                  <button onClick={() => setShowAllReplacement(!showAllReplacement)} className="text-xs text-blue-500 hover:underline">
                    {showAllReplacement ? 'Show Less' : `Show All (${replacementItems.length})`}
                  </button>
                )}
              </div>
              {replacementItems.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(showAllReplacement ? replacementItems : replacementItems.slice(0, 5)).map(item => <ItemRow key={item.id} item={item} />)}
                </div>
              ) : (
                <p className={`${textSecondary} text-sm`}>No items flagged for replacement.</p>
              )}
            </div>

            {/* Throw Away Soon */}
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 text-sm sm:text-base`}><Trash2 size={16} className="text-red-500" /> Throw Away Soon</h3>
                {throwAwayItems.length > 5 && (
                  <button onClick={() => setShowAllThrowAway(!showAllThrowAway)} className="text-xs text-blue-500 hover:underline">
                    {showAllThrowAway ? 'Show Less' : `Show All (${throwAwayItems.length})`}
                  </button>
                )}
              </div>
              {throwAwayItems.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(showAllThrowAway ? throwAwayItems : throwAwayItems.slice(0, 5)).map(item => <ItemRow key={item.id} item={item} />)}
                </div>
              ) : (
                <p className={`${textSecondary} text-sm`}>No items flagged for disposal.</p>
              )}
            </div>

            {/* Category Breakdown */}
            <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 text-sm sm:text-base`}><PieChart size={16} className="text-blue-500" /> By Category</h3>
                {categoryBreakdown.length > 6 && (
                  <button onClick={() => setShowAllCategories(!showAllCategories)} className="text-xs text-blue-500 hover:underline">
                    {showAllCategories ? 'Show Less' : `Show All (${categoryBreakdown.length})`}
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(showAllCategories ? categoryBreakdown : categoryBreakdown.slice(0, 6)).map(cat => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="w-6 text-center text-sm">{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs sm:text-sm ${textPrimary} truncate`}>{cat.name}</span>
                        <span className={`text-xs ${textSecondary} ml-2`}>{cat.itemCount}</span>
                      </div>
                      <div className={`h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                        <div className="h-full rounded-full" style={{ width: `${(cat.itemCount / totalItems) * 100}%`, backgroundColor: cat.color || '#3B82F6' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location Breakdown - Always show */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold ${textPrimary} flex items-center gap-2 text-sm sm:text-base`}><MapPin size={16} className="text-green-500" /> By Location</h3>
            {locationBreakdown.length > 6 && (
              <button onClick={() => setShowAllLocations(!showAllLocations)} className="text-xs text-blue-500 hover:underline">
                {showAllLocations ? 'Show Less' : `Show All (${locationBreakdown.length})`}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(showAllLocations ? locationBreakdown : locationBreakdown.slice(0, 6)).map(loc => (
              <div key={loc.id} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`font-medium ${textPrimary} text-xs sm:text-sm truncate`}>{loc.path}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${textSecondary}`}>{loc.itemCount} items</span>
                  <span className="text-xs text-green-600">${loc.totalValue.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Detail Modal */}
        <ItemDetailModal />
      </div>
    );
  };

  // ============================================
  // WISHLIST PAGE
  // ============================================
  const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [showAddWishlist, setShowAddWishlist] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemNotes, setNewItemNotes] = useState('');
    const [newItemPriority, setNewItemPriority] = useState('medium');
    const [newItemUrl, setNewItemUrl] = useState('');
    const [loadingWishlist, setLoadingWishlist] = useState(true);

    // Load wishlist from Supabase
    useEffect(() => {
      const loadWishlist = async () => {
        try {
          const { data, error } = await supabase
            .from('wishlist')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) setWishlistItems(data);
        } catch (err) {
          console.error('Failed to load wishlist:', err);
        }
        setLoadingWishlist(false);
      };
      loadWishlist();
    }, []);

    const addWishlistItem = async () => {
      if (!newItemName.trim()) return;
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ 
          name: newItemName.trim(), 
          notes: newItemNotes || null,
          priority: newItemPriority,
          url: newItemUrl || null,
          created_by: userData.user?.id
        })
        .select()
        .single();
      if (!error && data) {
        setWishlistItems([data, ...wishlistItems]);
        setNewItemName('');
        setNewItemNotes('');
        setNewItemPriority('medium');
        setNewItemUrl('');
        setShowAddWishlist(false);
      }
    };

    const markAsPurchased = async (wishlistItem: any) => {
      // Set today's date as purchase date
      const today = new Date().toISOString().split('T')[0];
      // Add to inventory with pre-filled data
      setItemFormInitialData({ 
        name: wishlistItem.name, 
        notes: wishlistItem.notes || '',
        acquired_date: today
      });
      openAddModal();
      // Remove from wishlist
      await supabase.from('wishlist').delete().eq('id', wishlistItem.id);
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItem.id));
    };

    const deleteWishlistItem = async (id: string) => {
      await supabase.from('wishlist').delete().eq('id', id);
      setWishlistItems(wishlistItems.filter(item => item.id !== id));
    };

    const priorityColors = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-green-500' };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Wishlist</h2>
            <p className={`text-sm ${textSecondary}`}>Items you want to acquire</p>
          </div>
          <button onClick={() => setShowAddWishlist(!showAddWishlist)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus size={18} /> Add Item
          </button>
        </div>

        {showAddWishlist && (
          <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Item Name *</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
                  placeholder="What do you want to buy?"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Priority</label>
                <select value={newItemPriority} onChange={(e) => setNewItemPriority(e.target.value)} className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Link/URL</label>
              <input
                type="url"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
                placeholder="https://example.com/product"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Notes</label>
              <textarea
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                rows={2}
                className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary} resize-none`}
                placeholder="Size, color, specifications..."
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addWishlistItem} disabled={!newItemName.trim()} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">Save</button>
              <button onClick={() => setShowAddWishlist(false)} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>Cancel</button>
            </div>
          </div>
        )}

        {loadingWishlist ? (
          <div className="flex justify-center py-8"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
        ) : wishlistItems.length === 0 ? (
          <div className={`${bgCard} border ${borderColor} rounded-lg p-12 text-center`}>
            <ShoppingCart size={48} className={`mx-auto mb-4 ${textSecondary}`} />
            <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>Your wishlist is empty</h3>
            <p className={`${textSecondary} mb-4`}>Add items you want to buy in the future.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map(item => (
              <div key={item.id} className={`${bgCard} border ${borderColor} rounded-lg p-4 group`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${textPrimary}`}>{item.name}</h3>
                  <span className={`text-xs font-medium ${priorityColors[item.priority as keyof typeof priorityColors]}`}>{item.priority}</span>
                </div>
                {item.notes && <p className={`text-sm ${textSecondary} mb-2`}>{item.notes}</p>}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block mb-2 truncate">{item.url}</a>}
                <div className={`text-xs ${textSecondary} mb-3`}>Added {formatRelativeTime(item.created_at)}</div>
                <div className="flex gap-2">
                  <button onClick={() => markAsPurchased(item)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                    <CheckCircle size={14} /> Purchased
                  </button>
                  <button onClick={() => deleteWishlistItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // SETTINGS PAGE
  // ============================================
  const SettingsPage = () => {
    // Use new hooks for user management with roles
    const { profile: currentUserProfile, loading: loadingProfile } = useCurrentUser();
    const { users: householdUsers, loading: loadingUsers, updateRole, error: usersError } = useUsers();

    // Safely check if user can manage roles (handles case where migration hasn't been run)
    const canManageRoles = currentUserProfile?.role ? canManageUsers(currentUserProfile.role) : false;

    const [localAppIcon, setLocalAppIcon] = useState(localStorage.getItem('appIcon') || '📦');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);

    const handleIconChange = (icon: string) => {
      setLocalAppIcon(icon);
      localStorage.setItem('appIcon', icon);
      setAppIconState(icon); // Update sidebar icon
      setShowIconPicker(false);
    };

    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      try {
        const { uploadItemImage, compressImage } = await import('./services/images');
        const compressed = await compressImage(file, 200);
        const imageUrl = await uploadItemImage(compressed, `profile-${user.id}`);
        await supabase.from('profiles').upsert({ id: user.id, avatar_url: imageUrl, email: user.email });
        // No need to manually refresh - hook will auto-refresh
      } catch (err) {
        console.error('Failed to upload profile picture:', err);
      }
    };

    return (
      <div className="space-y-6 max-w-3xl">
        <h2 className={`text-xl font-semibold ${textPrimary}`} style={textPrimaryStyle}>Settings</h2>
        
        {/* Theme Selection */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <h3 className={`font-medium ${textPrimary} mb-3 flex items-center gap-2`} style={textPrimaryStyle}>
            <Palette size={18} /> App Theme
          </h3>
          <p className={`text-sm ${textSecondary} mb-4`} style={textSecondaryStyle}>
            Choose a theme inspired by Uma Musume characters
          </p>
          
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: themeColors.primary }}
              >
                {theme.name.charAt(0)}
              </div>
              <div>
                <div className={`font-medium ${textPrimary}`} style={textPrimaryStyle}>{theme.name}</div>
                <div className={`text-sm ${textSecondary}`} style={textSecondaryStyle}>
                  {theme.character !== 'None' && <span className="mr-2">{theme.character}</span>}
                  {theme.description}
                </div>
              </div>
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="ml-auto px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: accentColor }}
              >
                Change Theme
              </button>
            </div>
            
            {/* Color preview - shows current mode colors */}
            <div className="flex gap-2 mb-2">
              <div className="flex-1 h-3 rounded" style={{ backgroundColor: themeColors.primary }} title="Primary" />
              <div className="flex-1 h-3 rounded" style={{ backgroundColor: themeColors.secondary }} title="Secondary" />
              <div className="flex-1 h-3 rounded" style={{ backgroundColor: themeColors.accent }} title="Accent" />
              <div className="flex-1 h-3 rounded" style={{ backgroundColor: themeColors.sidebar }} title="Sidebar" />
            </div>
            <div className={`text-xs ${textSecondary}`} style={textSecondaryStyle}>
              Currently showing {darkMode ? 'dark' : 'light'} mode colors
            </div>
          </div>

          {showThemePicker && (
            <div className={`border ${borderColor} rounded-lg p-4 mt-4 max-h-[32rem] overflow-y-auto`} style={borderColorStyle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {umaThemes.map((t) => {
                  const previewColors = darkMode ? t.dark : t.light;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                      className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                        currentTheme === t.id ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{ 
                        borderColor: previewColors.primary,
                        backgroundColor: previewColors.card,
                        '--tw-ring-color': previewColors.primary,
                      } as React.CSSProperties}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ background: `linear-gradient(135deg, ${previewColors.primary} 0%, ${previewColors.secondary} 100%)` }}
                        >
                          {t.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate" style={{ color: previewColors.text }}>{t.name}</div>
                          {t.character !== 'None' && (
                            <div className="text-xs truncate" style={{ color: previewColors.textSecondary }}>{t.character}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs mb-2 line-clamp-2" style={{ color: previewColors.textSecondary, fontFamily: t.fontFamily }}>
                        {t.description}
                      </div>
                      {/* Color swatches - primary, secondary, accent */}
                      <div className="flex gap-1">
                        <div className="flex-1 h-2 rounded" style={{ backgroundColor: previewColors.primary }} title="Primary" />
                        <div className="flex-1 h-2 rounded" style={{ backgroundColor: previewColors.secondary }} title="Secondary" />
                        <div className="flex-1 h-2 rounded" style={{ backgroundColor: previewColors.accent }} title="Accent" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* App Customization */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <h3 className={`font-medium ${textPrimary} mb-3`} style={textPrimaryStyle}>App Customization</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={textPrimary} style={textPrimaryStyle}>App Icon</div>
              <div className={`text-sm ${textSecondary}`} style={textSecondaryStyle}>Click to change the Inventorois icon</div>
            </div>
            <div className="relative">
              <button onClick={() => setShowIconPicker(!showIconPicker)} className="w-12 h-12 text-2xl rounded-lg flex items-center justify-center hover:ring-2" style={{ backgroundColor: highlightBg, '--tw-ring-color': accentColor } as React.CSSProperties}>
                {localAppIcon}
              </button>
              {showIconPicker && (
                <div className={`absolute right-0 mt-2 p-3 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-50 w-64`} style={{ ...bgCardStyle, ...borderColorStyle }}>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {ICON_OPTIONS.slice(0, 40).map(icon => (
                      <button key={icon} onClick={() => handleIconChange(icon)} className="w-9 h-9 text-lg rounded flex items-center justify-center transition-colors" style={{ ':hover': { backgroundColor: highlightBg } } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = highlightBg} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className={textPrimary} style={textPrimaryStyle}>Dark Mode</div>
              <div className={`text-sm ${textSecondary}`} style={textSecondaryStyle}>Use dark theme (overrides character theme)</div>
            </div>
            <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Your Profile */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <h3 className={`font-medium ${textPrimary} mb-3`} style={textPrimaryStyle}>Your Profile</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              {householdUsers.find(u => u.id === user?.id)?.avatar_url ? (
                <img src={householdUsers.find(u => u.id === user?.id)?.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <User size={24} className={textSecondary} />
                </div>
              )}
              <label 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                <Camera size={12} className="text-white" />
                <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
              </label>
            </div>
            <div>
              <div className={textPrimary} style={textPrimaryStyle}>{user?.email}</div>
              <div className={`text-sm ${textSecondary}`} style={textSecondaryStyle}>Click the camera to upload a profile picture</div>
            </div>
          </div>
        </div>

        {/* Household Members with Role Management */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <h3 className={`font-medium ${textPrimary} mb-3 flex items-center gap-2`} style={textPrimaryStyle}>
            <Users size={18} /> Household Members
          </h3>
          {usersError ? (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} text-yellow-800 ${darkMode ? 'text-yellow-200' : ''}`}>
              <p className="font-medium mb-2">⚠️ Database Migration Required</p>
              <p className="text-sm">To enable user role management, please run the database migration:</p>
              <ol className="text-sm mt-2 ml-4 list-decimal">
                <li>Open Supabase SQL Editor</li>
                <li>Run the migration from <code className="bg-black bg-opacity-20 px-1 rounded">database/add-role-permissions.sql</code></li>
              </ol>
            </div>
          ) : loadingUsers ? (
            <div className="flex justify-center py-4">
              <Loader2 size={24} className="animate-spin" style={{ color: accentColor }} />
            </div>
          ) : householdUsers.length > 0 ? (
            <div className="space-y-3">
              {householdUsers.map(u => (
                <div key={u.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {/* Avatar */}
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.display_name || u.email || ''} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                      <User size={16} className={textSecondary} />
                    </div>
                  )}

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className={`${textPrimary} truncate`} style={textPrimaryStyle}>
                      {u.display_name || u.email}
                    </div>
                    <div className={`text-xs ${textSecondary} flex items-center gap-2`} style={textSecondaryStyle}>
                      {u.id === user?.id && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: accentColor, color: 'white' }}>
                          You
                        </span>
                      )}
                      <span>{u.role ? ROLE_LABELS[u.role] : 'Member'}</span>
                    </div>
                  </div>

                  {/* Role selector (admin only, can't change own role) */}
                  {canManageRoles && u.id !== user?.id && u.role && (
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as any)}
                      className={`px-3 py-1.5 rounded-lg border ${borderColor} text-sm`}
                      style={{ backgroundColor: bgCard, ...borderColorStyle }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      {currentUserProfile?.role === 'owner' && <option value="owner">Owner</option>}
                    </select>
                  )}

                  {/* Role badge (non-admin or own profile) */}
                  {(!canManageRoles || u.id === user?.id) && (
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      {u.role ? ROLE_LABELS[u.role] : 'Member'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${textSecondary}`} style={textSecondaryStyle}>No other household members yet.</p>
          )}

          {/* Role descriptions (show for admins) */}
          {canManageRoles && (
            <div className={`mt-4 pt-4 border-t ${borderColor} text-xs ${textSecondary}`} style={{ ...borderColorStyle, ...textSecondaryStyle }}>
              <div className="font-medium mb-2">Role Permissions:</div>
              <ul className="space-y-1">
                <li><strong>Owner/Admin:</strong> Full access including user management</li>
                <li><strong>Member:</strong> Can add/edit items (cannot delete or manage categories/locations)</li>
                <li><strong>Viewer:</strong> Read-only access</li>
              </ul>
            </div>
          )}
        </div>

        {/* Data Export */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <h3 className={`font-medium ${textPrimary} mb-3`} style={textPrimaryStyle}>Data Export</h3>
          <button onClick={handleExportCSV} className={`flex items-center gap-2 px-4 py-2 border ${borderColor} rounded-lg ${textPrimary} hover:opacity-80`} style={{ ...textPrimaryStyle, ...borderColorStyle }}>
            <Download size={18} /> Export to CSV
          </button>
        </div>

        {/* Sign Out */}
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return inventoryContent;
      case 'wishlist': return <WishlistPage />;
      case 'analysis': return <AnalysisPage />;
      case 'categories': return <CategoriesPage />;
      case 'locations': return <LocationsPage />;
      case 'tags': return <TagsPage />;
      case 'templates': return <TemplatesPage />;
      case 'history': return <HistoryPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} flex`} style={bgMainStyle}>
      <div className="hidden md:block"><Sidebar /></div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`${bgCard} border-b ${borderColor} px-4 py-3 flex items-center justify-between`} style={{ ...bgCardStyle, ...borderColorStyle }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileSidebarOpen(true)}><Menu size={24} className={textPrimary} style={textPrimaryStyle} /></button>
            <h1 className={`text-xl font-semibold ${textPrimary} capitalize`} style={textPrimaryStyle}>{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} relative`}>
                <Bell size={20} className={textPrimary} style={textPrimaryStyle} />{unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${bgCard} border ${borderColor} rounded-lg p-4`} style={{ ...bgCardStyle, ...borderColorStyle }}>
                  <div className={`p-3 border-b ${borderColor} flex justify-between items-center`} style={borderColorStyle}><span className={`font-semibold ${textPrimary}`} style={textPrimaryStyle}>Notifications</span><button onClick={markAllAsRead} className="text-sm" style={{ color: accentColor }}>Mark all read</button></div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-3 border-b ${borderColor} cursor-pointer ${!notif.is_read ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`} style={borderColorStyle}>
                        <div className={`font-medium ${textPrimary}`} style={textPrimaryStyle}>{notif.title}</div><div className={`text-sm ${textSecondary}`} style={textSecondaryStyle}>{notif.body}</div>
                      </div>
                    )) : <p className={`p-4 text-sm ${textSecondary}`} style={textSecondaryStyle}>No notifications</p>}
                  </div>
                </div>
              )}
            </div>
            <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>{darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className={textPrimary} />}</button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto" onClick={() => { setShowItemMenu(null); setShowNotifications(false); }}>{renderPage()}</main>

        {showUndoToast && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgCard} border ${borderColor} rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 z-50`}>
            <span className={textPrimary}>Item updated</span><button onClick={hideToast}><X size={16} className={textSecondary} /></button>
          </div>
        )}
      </div>

      {/* MODALS with isolated form components */}
      <Modal show={showAddModal} onClose={() => { setItemFormInitialData(null); closeAddModal(); }} title="Add New Item" darkMode={darkMode}>
        <ItemForm
          key={showAddModal ? 'open' : 'closed'}
          onSubmit={handleCreateItem}
          onCancel={() => { setItemFormInitialData(null); closeAddModal(); }}
          categories={categories}
          locationOptions={locationOptions}
          tags={tags}
          onCreateTag={handleCreateTagInline}
          initialData={itemFormInitialData}
          isEditMode={false}
          darkMode={darkMode}
        />
      </Modal>

      {/* Edit Item Modal */}
      <Modal show={!!editingItem} onClose={() => setEditingItem(null)} title="Edit Item" darkMode={darkMode}>
        {editingItem && (
          <ItemForm
            key={editingItem.id}
            onSubmit={handleUpdateItem}
            onCancel={() => setEditingItem(null)}
            categories={categories}
            locationOptions={locationOptions}
            tags={tags}
            onCreateTag={handleCreateTagInline}
            initialData={{
              id: editingItem.id,
              name: editingItem.name,
              quantity: editingItem.quantity,
              unit: editingItem.unit,
              category_id: editingItem.category_id || '',
              location_id: editingItem.locations?.find(l => l.is_primary)?.location_id || '',
              min_threshold: editingItem.min_threshold?.toString() || '',
              purchase_price: editingItem.purchase_price?.toString() || '',
              is_essential: editingItem.is_essential,
              is_favorite: editingItem.is_favorite,
              image_url: editingItem.image_url || '',
              tag_ids: editingItem.tags?.map(t => t.id) || [],
              notes: editingItem.notes || '',
              expiration_date: editingItem.expiration_date || '',
              acquired_date: editingItem.acquired_date || '',
              needs_replacement: editingItem.needs_replacement || false,
              throw_away_soon: editingItem.throw_away_soon || false,
            }}
            isEditMode={true}
            darkMode={darkMode}
          />
        )}
      </Modal>

      <Modal show={showLocationModal} onClose={() => setShowLocationModal(false)} title="Add New Location" darkMode={darkMode}>
        <LocationForm
          key={showLocationModal ? 'open' : 'closed'}
          onSubmit={handleCreateLocation}
          onCancel={() => setShowLocationModal(false)}
          locationOptions={locationOptions}
          darkMode={darkMode}
        />
      </Modal>

      <Modal show={showTagModal} onClose={() => setShowTagModal(false)} title="Add New Tag" darkMode={darkMode}>
        <TagForm
          key={showTagModal ? 'open' : 'closed'}
          onSubmit={handleCreateTag}
          onCancel={() => setShowTagModal(false)}
          darkMode={darkMode}
        />
      </Modal>

      <Modal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Add New Category" darkMode={darkMode}>
        <CategoryForm
          key={showCategoryModal ? 'open' : 'closed'}
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCategoryModal(false)}
          categories={categories}
          isEditMode={false}
          darkMode={darkMode}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={!!editingCategory} onClose={() => setEditingCategory(null)} title="Edit Category" darkMode={darkMode}>
        {editingCategory && (
          <CategoryForm
            key={editingCategory.id}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
            categories={categories}
            initialData={editingCategory}
            isEditMode={true}
            darkMode={darkMode}
          />
        )}
      </Modal>

      <Modal show={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete" darkMode={darkMode}>
        <div className="p-4">
          <p className={`${textPrimary} mb-4`}>Are you sure you want to delete this item?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteConfirm(null)} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>Cancel</button>
            <button onClick={() => showDeleteConfirm && handleDeleteItem(showDeleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// ROOT APP COMPONENT
// ============================================
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
  }

  return user ? <MainApp /> : <AuthScreen />;
}
