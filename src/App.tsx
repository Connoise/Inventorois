import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Home, Package, FolderTree, MapPin, Tags, FileText, History, Settings,
  Plus, Search, Filter, Grid, List, Moon, Sun, Bell, Menu, X, ChevronRight,
  ChevronDown, Star, StarOff, AlertTriangle, Edit2, Trash2, Download,
  MoreVertical, Clock, Undo2, LogOut, Loader2, Camera, Image as ImageIcon
} from 'lucide-react';

import { useAuth } from './hooks';
import { useItems, useCategories, useLocations, useTags, useTemplates, useHistory, useNotifications } from './hooks';
import { useUIStore, useFilterStore, useUndoStore } from './stores';
import { formatRelativeTime, getStatusColor, getStatusLabel, exportToCSV } from './utils';
import { signIn, signUp, signOut } from './lib/supabase';
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

const COLOR_OPTIONS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#78716C', '#71717A',
];

const ICON_OPTIONS = ['📦', '🍳', '🛁', '✨', '💻', '📝', '🛏️', '🔧', '💊', '🐕', '🌳', '📁', '🎮', '👕', '🚗', '📚', '🎨', '🏠'];

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
  darkMode 
}: {
  onSubmit: (data: { name: string; icon: string; color: string; parent_id: string }) => void;
  onCancel: () => void;
  categories: { id: string; name: string }[];
  darkMode: boolean;
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#6B7280');
  const [parentId, setParentId] = useState('');

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, icon, color, parent_id: parentId });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
          {ICON_OPTIONS.map(ic => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 ${icon === ic ? 'border-blue-500' : 'border-transparent'} ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              {ic}
            </button>
          ))}
        </div>
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
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Parent Category</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          <option value="">None (Top Level)</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className={`flex justify-end gap-3 pt-4 border-t ${borderColor}`}>
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Add Category
        </button>
      </div>
    </form>
  );
});

// Item Form Component
const ItemForm = memo(({ 
  onSubmit, 
  onCancel, 
  categories,
  locationOptions,
  initialData,
  darkMode 
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  categories: { id: string; name: string }[];
  locationOptions: { id: string; path: string; depth: number }[];
  initialData?: { name?: string; unit?: string; min_threshold?: string; is_essential?: boolean; image_url?: string };
  darkMode: boolean;
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(initialData?.unit || 'units');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [minThreshold, setMinThreshold] = useState(initialData?.min_threshold || '');
  const [price, setPrice] = useState('');
  const [isEssential, setIsEssential] = useState(initialData?.is_essential || false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      quantity,
      unit,
      category_id: categoryId,
      location_id: locationId,
      min_threshold: minThreshold,
      purchase_price: price,
      is_essential: isEssential,
      is_favorite: isFavorite,
      image_file: imageFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Photo Upload Section */}
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Photo</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
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
            <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed ${borderColor} rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <Camera size={24} className={textSecondary} />
              <span className={`text-xs ${textSecondary} mt-1`}>Add Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          {!imagePreview && (
            <div className={`text-sm ${textSecondary}`}>
              <p>Tap to take a photo</p>
              <p>or select from gallery</p>
            </div>
          )}
        </div>
      </div>

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
      <div className="grid grid-cols-2 gap-4">
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
          </select>
        </div>
      </div>
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
      <div>
        <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
        >
          <option value="">Select location</option>
          {locationOptions.map(loc => (
            <option key={loc.id} value={loc.id}>{'  '.repeat(loc.depth)}{loc.path}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Min Threshold</label>
          <input
            type="number"
            value={minThreshold}
            onChange={(e) => setMinThreshold(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
            min="0"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Price</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}
            min="0"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className={`flex items-center gap-2 ${textPrimary}`}>
          <input type="checkbox" checked={isEssential} onChange={(e) => setIsEssential(e.target.checked)} /> Essential
        </label>
        <label className={`flex items-center gap-2 ${textPrimary}`}>
          <input type="checkbox" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} /> Favorite
        </label>
      </div>
      <div className={`flex justify-end gap-3 pt-4 border-t ${borderColor}`}>
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary}`}>
          Cancel
        </button>
        <button type="submit" disabled={isUploading} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
          {isUploading && <Loader2 size={16} className="animate-spin" />}
          Add Item
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
          <h1 className="text-2xl font-bold text-gray-900">HomeBase</h1>
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
  const { darkMode, toggleDarkMode, viewMode, setViewMode, showFilters, toggleFilters, showAddModal, openAddModal, closeAddModal } = useUIStore();
  const { filters, setSearch, setFilter, clearFilters } = useFilterStore();
  const { showUndoToast, hideToast } = useUndoStore();
  
  const { items, loading: itemsLoading, updateQuantity, toggleFavorite, createItem, updateItem, archiveItem } = useItems();
  const { categories, createCategory, deleteCategory } = useCategories();
  const { locations, locationOptions, createLocation, deleteLocation } = useLocations();
  const { tags, createTag, deleteTag } = useTags();
  const { templates, useTemplate } = useTemplates();
  const { history, undoChange } = useHistory();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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
  
  // Template data for item form
  const [itemFormInitialData, setItemFormInitialData] = useState<any>(null);

  // Theme-based styles
  const bgMain = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
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
          description: null,
          is_archived: false,
          max_threshold: null,
          current_value: null,
          currency: 'USD',
          barcode: null,
          sku: null,
          model_number: null,
          serial_number: null,
          acquired_date: null,
          expiration_date: null,
          warranty_expiration: null,
          last_checked_date: null,
          notes: null,
          image_url: null,
          custom_fields: {},
        },
        data.location_id || undefined
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
  const ItemCard = useCallback(({ item }: { item: ItemWithRelations }) => (
    <div className={`${bgCard} rounded-lg border ${borderColor} overflow-hidden hover:shadow-lg transition-shadow relative`}>
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
              <div className={`absolute right-0 mt-1 w-32 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-10`}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); setShowItemMenu(null); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                >
                  <Trash2 size={14} /> Delete
                </button>
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
            <div className={`absolute right-0 mt-1 w-32 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-10`}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); setShowItemMenu(null); }}
                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 rounded-lg"
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
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${textPrimary}`}>{item.name}</h3>
              {item.is_essential && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>}
            </div>
            <p className={`text-sm ${textSecondary}`}>{item.category?.name || 'Uncategorized'}</p>
          </div>
          {!item.image_url && (
            <button onClick={() => toggleFavorite(item.id)} className="p-1">
              {item.is_favorite ? <Star size={20} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={20} className={textSecondary} />}
            </button>
          )}
        </div>

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

        <div className={`text-xs ${textSecondary} space-y-1`}>
          {item.primary_location && <div className="flex items-center gap-1"><MapPin size={12} /><span>{item.primary_location}</span></div>}
          <div className="flex items-center gap-1"><Clock size={12} /><span>Updated {formatRelativeTime(item.updated_at)}</span></div>
        </div>
      </div>
    </div>
  ), [bgCard, borderColor, darkMode, textPrimary, textSecondary, showItemMenu, toggleFavorite, updateQuantity]);

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
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'w-full' : 'w-56'} ${bgCard} h-full flex flex-col border-r ${borderColor}`}>
      <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><Package size={18} className="text-white" /></div>
          <span className={`font-bold text-lg ${textPrimary}`}>HomeBase</span>
        </div>
        {mobile && <button onClick={() => setMobileSidebarOpen(false)}><X size={24} className={textPrimary} /></button>}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setCurrentPage(item.id); if (mobile) setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              currentPage === item.id ? 'bg-blue-500 text-white' : `${textSecondary} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
            }`}
          >
            <item.icon size={18} /><span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`p-3 border-t ${borderColor}`}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded text-center`}>
            <div className={`text-lg font-bold ${textPrimary}`}>{items.length}</div>
            <div className={`text-xs ${textSecondary}`}>Items</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded text-center`}>
            <div className="text-lg font-bold text-yellow-500">{items.filter(i => i.status === 'low_stock').length}</div>
            <div className={`text-xs ${textSecondary}`}>Low</div>
          </div>
        </div>
        <button onClick={() => signOut()} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${textSecondary} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <LogOut size={16} /><span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );

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
                  <span className={textPrimary}>{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}><div className={`text-2xl font-bold ${textPrimary}`}>{items.length}</div><div className={textSecondary}>Total Items</div></div>
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}><div className="text-2xl font-bold text-green-500">{items.filter(i => i.status === 'in_stock').length}</div><div className={textSecondary}>In Stock</div></div>
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}><div className="text-2xl font-bold text-yellow-500">{items.filter(i => i.status === 'low_stock').length}</div><div className={textSecondary}>Low Stock</div></div>
          <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}><div className="text-2xl font-bold text-red-500">{items.filter(i => i.status === 'out_of_stock').length}</div><div className={textSecondary}>Out of Stock</div></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
            <h3 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}><Clock size={18} /> Recently Updated</h3>
            <div className="space-y-2">
              {recentItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div><div className={textPrimary}>{item.name}</div><div className={`text-xs ${textSecondary}`}>{formatRelativeTime(item.updated_at)}</div></div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
              {recentItems.length === 0 && <p className={`text-sm ${textSecondary}`}>No items yet</p>}
            </div>
          </div>

          <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
            <h3 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}><Star size={18} className="text-yellow-500" /> Favorites</h3>
            <div className="space-y-2">
              {favoriteItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div><div className={textPrimary}>{item.name}</div><div className={`text-xs ${textSecondary}`}>{item.primary_location}</div></div>
                  <div className="flex items-center gap-2"><span className={`font-medium ${textPrimary}`}>{item.quantity} {item.unit}</span><StatusBadge status={item.status} /></div>
                </div>
              ))}
              {favoriteItems.length === 0 && <p className={`text-sm ${textSecondary}`}>No favorites yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Inventory = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className={`flex-1 flex items-center gap-2 ${bgCard} border ${borderColor} rounded-lg px-3 py-2`}>
            <Search size={18} className={textSecondary} />
            <input type="text" placeholder="Search items..." value={filters.search || ''} onChange={(e) => setSearch(e.target.value)} className={`flex-1 bg-transparent outline-none ${textPrimary}`} />
          </div>
          <button onClick={toggleFilters} className={`p-2 rounded-lg border ${borderColor} ${bgCard} ${showFilters ? 'ring-2 ring-blue-500' : ''}`}><Filter size={18} className={textSecondary} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className={`p-2 rounded-lg border ${borderColor} ${bgCard}`} title="Export CSV"><Download size={18} className={textSecondary} /></button>
          <div className={`flex rounded-lg border ${borderColor} overflow-hidden`}>
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : bgCard}`}><Grid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : bgCard}`}><List size={18} /></button>
          </div>
          <button onClick={() => { setItemFormInitialData(null); openAddModal(); }} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><Plus size={18} /><span className="hidden sm:inline">Add Item</span></button>
        </div>
      </div>

      {showFilters && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={`text-sm ${textSecondary} block mb-1`}>Category</label>
              <select value={filters.category_id || ''} onChange={(e) => setFilter('category_id', e.target.value || undefined)} className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-sm ${textSecondary} block mb-1`}>Status</label>
              <select value={filters.status || ''} onChange={(e) => setFilter('status', e.target.value as any || undefined)} className={`w-full p-2 rounded border ${borderColor} ${inputBg} ${textPrimary}`}>
                <option value="">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className={`flex items-center gap-2 ${textPrimary} text-sm`}><input type="checkbox" checked={filters.is_essential || false} onChange={(e) => setFilter('is_essential', e.target.checked || undefined)} />Essentials</label>
              <label className={`flex items-center gap-2 ${textPrimary} text-sm`}><input type="checkbox" checked={filters.is_favorite || false} onChange={(e) => setFilter('is_favorite', e.target.checked || undefined)} />Favorites</label>
            </div>
            <div className="flex items-end"><button onClick={clearFilters} className="text-sm text-blue-500 hover:underline">Clear Filters</button></div>
          </div>
        </div>
      )}

      {itemsLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
      ) : items.length === 0 ? (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-12 text-center`}>
          <Package size={48} className={`mx-auto mb-4 ${textSecondary}`} />
          <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No items yet</h3>
          <p className={`${textSecondary} mb-4`}>Start building your inventory.</p>
          <button onClick={() => { setItemFormInitialData(null); openAddModal(); }} className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><Plus size={18} /> Add Your First Item</button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
          {items.map(item => viewMode === 'grid' ? <ItemCard key={item.id} item={item} /> : (
            <div key={item.id} className={`${bgCard} border ${borderColor} rounded-lg p-3 flex items-center gap-4`}>
              <button onClick={() => toggleFavorite(item.id)}>{item.is_favorite ? <Star size={18} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={18} className={textSecondary} />}</button>
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
        <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><Plus size={18} /> Add Category</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className={`${bgCard} border ${borderColor} rounded-lg p-4 group`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '20' }}>{cat.icon}</div>
              <div className="flex-1"><h3 className={`font-semibold ${textPrimary}`}>{cat.name}</h3><p className={`text-sm ${textSecondary}`}>{cat.item_count || 0} items</p></div>
              {!cat.is_system && <button onClick={() => handleDeleteCategory(cat.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16} /></button>}
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
        <button onClick={() => setShowLocationModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><Plus size={18} /> Add Location</button>
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
        <button onClick={() => setShowTagModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><Plus size={18} /> Add Tag</button>
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

  const TemplatesPage = () => (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Item Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div key={template.id} className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
            <h3 className={`font-semibold ${textPrimary}`}>{template.name}</h3>
            <div className={`text-sm ${textSecondary} mb-3`}>Unit: {template.template_data.unit || 'units'}</div>
            <button
              onClick={() => {
                useTemplate(template.id);
                setItemFormInitialData({
                  name: template.name,
                  unit: template.template_data.unit || 'units',
                  min_threshold: template.template_data.min_threshold?.toString() || '',
                  is_essential: template.template_data.is_essential || false,
                });
                openAddModal();
              }}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
            ><Plus size={16} /> Use Template</button>
          </div>
        ))}
        {templates.length === 0 && <p className={textSecondary}>No templates available.</p>}
      </div>
    </div>
  );

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

  const SettingsPage = () => (
    <div className="space-y-6 max-w-2xl">
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Settings</h2>
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div><div className={textPrimary}>Dark Mode</div><div className={`text-sm ${textSecondary}`}>Use dark theme</div></div>
          <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
        </div>
      </div>
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}><button onClick={handleExportCSV} className={`flex items-center gap-2 px-4 py-2 border ${borderColor} rounded-lg ${textPrimary}`}><Download size={18} /> Export to CSV</button></div>
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}><p className={`text-sm ${textSecondary} mb-4`}>Signed in as {user?.email}</p><button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><LogOut size={18} /> Sign Out</button></div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
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
    <div className={`min-h-screen ${bgMain} flex`}>
      <div className="hidden md:block"><Sidebar /></div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`${bgCard} border-b ${borderColor} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileSidebarOpen(true)}><Menu size={24} className={textPrimary} /></button>
            <h1 className={`text-xl font-semibold ${textPrimary} capitalize`}>{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} relative`}>
                <Bell size={20} className={textPrimary} />{unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-50`}>
                  <div className={`p-3 border-b ${borderColor} flex justify-between items-center`}><span className={`font-semibold ${textPrimary}`}>Notifications</span><button onClick={markAllAsRead} className="text-sm text-blue-500">Mark all read</button></div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-3 border-b ${borderColor} cursor-pointer ${!notif.is_read ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}>
                        <div className={`font-medium ${textPrimary}`}>{notif.title}</div><div className={`text-sm ${textSecondary}`}>{notif.body}</div>
                      </div>
                    )) : <p className={`p-4 text-sm ${textSecondary}`}>No notifications</p>}
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
          initialData={itemFormInitialData}
          darkMode={darkMode}
        />
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
          darkMode={darkMode}
        />
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
