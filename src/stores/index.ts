import { create } from 'zustand';
import type { ItemWithRelations, ItemFilters } from '../types/supabase';

// Uma Musume Character Themes
export interface UmaTheme {
  id: string;
  name: string;
  character: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    sidebar: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fontFamily: string;
  iconStyle: 'modern' | 'elegant' | 'playful' | 'bold' | 'soft';
}

export const umaThemes: UmaTheme[] = [
  {
    id: 'default',
    name: 'Default',
    character: 'None',
    description: 'Clean modern interface',
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      background: '#F9FAFB',
      sidebar: '#1F2937',
      card: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    },
    fontFamily: 'system-ui, -apple-system, sans-serif',
    iconStyle: 'modern',
  },
  {
    id: 'silence-suzuka',
    name: 'Silence Suzuka',
    character: 'サイレンススズカ',
    description: 'Elegant and swift, like the wind',
    colors: {
      primary: '#059669',
      secondary: '#F97316',
      accent: '#10B981',
      background: '#F0FDF4',
      sidebar: '#064E3B',
      card: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#A7F3D0',
    },
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    iconStyle: 'elegant',
  },
  {
    id: 'special-week',
    name: 'Special Week',
    character: 'スペシャルウィーク',
    description: 'Bright and energetic champion',
    colors: {
      primary: '#2563EB',
      secondary: '#FBBF24',
      accent: '#3B82F6',
      background: '#EFF6FF',
      sidebar: '#1E3A8A',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      border: '#BFDBFE',
    },
    fontFamily: '"Nunito", "Comic Sans MS", sans-serif',
    iconStyle: 'playful',
  },
  {
    id: 'tokai-teio',
    name: 'Tokai Teio',
    character: 'トウカイテイオー',
    description: 'Emperor\'s royal confidence',
    colors: {
      primary: '#7C3AED',
      secondary: '#FBBF24',
      accent: '#A78BFA',
      background: '#FAF5FF',
      sidebar: '#4C1D95',
      card: '#FFFFFF',
      text: '#4C1D95',
      textSecondary: '#7C3AED',
      border: '#DDD6FE',
    },
    fontFamily: '"Playfair Display", Georgia, serif',
    iconStyle: 'bold',
  },
  {
    id: 'mejiro-mcqueen',
    name: 'Mejiro McQueen',
    character: 'メジロマックイーン',
    description: 'Noble elegance and grace',
    colors: {
      primary: '#BE185D',
      secondary: '#F9A8D4',
      accent: '#EC4899',
      background: '#FDF2F8',
      sidebar: '#831843',
      card: '#FFFFFF',
      text: '#831843',
      textSecondary: '#BE185D',
      border: '#FBCFE8',
    },
    fontFamily: '"Libre Baskerville", "Times New Roman", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'rice-shower',
    name: 'Rice Shower',
    character: 'ライスシャワー',
    description: 'Gentle dark beauty',
    colors: {
      primary: '#1F2937',
      secondary: '#9333EA',
      accent: '#6B7280',
      background: '#F3F4F6',
      sidebar: '#111827',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#D1D5DB',
    },
    fontFamily: '"EB Garamond", Georgia, serif',
    iconStyle: 'soft',
  },
  {
    id: 'gold-ship',
    name: 'Gold Ship',
    character: 'ゴールドシップ',
    description: 'Unpredictable golden chaos',
    colors: {
      primary: '#B45309',
      secondary: '#FCD34D',
      accent: '#F59E0B',
      background: '#FFFBEB',
      sidebar: '#78350F',
      card: '#FFFFFF',
      text: '#78350F',
      textSecondary: '#B45309',
      border: '#FDE68A',
    },
    fontFamily: '"Fredoka One", "Comic Sans MS", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'vodka',
    name: 'Vodka',
    character: 'ウオッカ',
    description: 'Cool and competitive spirit',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#22D3EE',
      background: '#ECFEFF',
      sidebar: '#164E63',
      card: '#FFFFFF',
      text: '#164E63',
      textSecondary: '#0891B2',
      border: '#A5F3FC',
    },
    fontFamily: '"Roboto Condensed", Arial, sans-serif',
    iconStyle: 'bold',
  },
  {
    id: 'daiwa-scarlet',
    name: 'Daiwa Scarlet',
    character: 'ダイワスカーレット',
    description: 'Passionate scarlet flame',
    colors: {
      primary: '#DC2626',
      secondary: '#FBBF24',
      accent: '#EF4444',
      background: '#FEF2F2',
      sidebar: '#7F1D1D',
      card: '#FFFFFF',
      text: '#7F1D1D',
      textSecondary: '#DC2626',
      border: '#FECACA',
    },
    fontFamily: '"Lora", Georgia, serif',
    iconStyle: 'bold',
  },
  {
    id: 'grass-wonder',
    name: 'Grass Wonder',
    character: 'グラスワンダー',
    description: 'Serene forest wanderer',
    colors: {
      primary: '#16A34A',
      secondary: '#84CC16',
      accent: '#22C55E',
      background: '#F0FDF4',
      sidebar: '#14532D',
      card: '#FFFFFF',
      text: '#14532D',
      textSecondary: '#16A34A',
      border: '#BBF7D0',
    },
    fontFamily: '"Merriweather", Georgia, serif',
    iconStyle: 'soft',
  },
  {
    id: 'symboli-rudolf',
    name: 'Symboli Rudolf',
    character: 'シンボリルドルフ',
    description: 'The absolute emperor',
    colors: {
      primary: '#1E40AF',
      secondary: '#C084FC',
      accent: '#3B82F6',
      background: '#EFF6FF',
      sidebar: '#1E3A5F',
      card: '#FFFFFF',
      text: '#1E3A5F',
      textSecondary: '#1E40AF',
      border: '#BFDBFE',
    },
    fontFamily: '"Cinzel", "Times New Roman", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'oguri-cap',
    name: 'Oguri Cap',
    character: 'オグリキャップ',
    description: 'The beloved idol of crowds',
    colors: {
      primary: '#0D9488',
      secondary: '#F472B6',
      accent: '#14B8A6',
      background: '#F0FDFA',
      sidebar: '#134E4A',
      card: '#FFFFFF',
      text: '#134E4A',
      textSecondary: '#0D9488',
      border: '#99F6E4',
    },
    fontFamily: '"Quicksand", Arial, sans-serif',
    iconStyle: 'soft',
  },
];

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  darkMode: boolean;
  viewMode: 'grid' | 'list';
  showFilters: boolean;
  showAddModal: boolean;
  showEditModal: boolean;
  editingItemId: string | null;
  currentTheme: string;
  
  // Actions
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  toggleDarkMode: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleFilters: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (itemId: string) => void;
  closeEditModal: () => void;
  setTheme: (themeId: string) => void;
  getTheme: () => UmaTheme;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  darkMode: localStorage.getItem('darkMode') === 'true',
  viewMode: (localStorage.getItem('viewMode') as 'grid' | 'list') || 'grid',
  showFilters: false,
  showAddModal: false,
  showEditModal: false,
  editingItemId: null,
  currentTheme: localStorage.getItem('umaTheme') || 'default',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    localStorage.setItem('darkMode', String(newMode));
    return { darkMode: newMode };
  }),
  setViewMode: (mode) => {
    localStorage.setItem('viewMode', mode);
    set({ viewMode: mode });
  },
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  openAddModal: () => set({ showAddModal: true }),
  closeAddModal: () => set({ showAddModal: false }),
  openEditModal: (itemId) => set({ showEditModal: true, editingItemId: itemId }),
  closeEditModal: () => set({ showEditModal: false, editingItemId: null }),
  setTheme: (themeId) => {
    localStorage.setItem('umaTheme', themeId);
    set({ currentTheme: themeId });
  },
  getTheme: () => {
    const { currentTheme } = get();
    return umaThemes.find(t => t.id === currentTheme) || umaThemes[0];
  },
}));

// Filter State Store
interface FilterState {
  filters: ItemFilters;
  setFilter: <K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  clearFilters: () => set({ filters: {} }),
  setSearch: (search) => set((state) => ({
    filters: { ...state.filters, search }
  })),
}));

// Undo/Redo Store
interface UndoAction {
  type: string;
  itemId: string;
  previousState: ItemWithRelations;
  newState: ItemWithRelations;
  timestamp: number;
}

interface UndoState {
  undoStack: UndoAction[];
  redoStack: UndoAction[];
  showUndoToast: boolean;
  lastAction: UndoAction | null;

  pushUndo: (action: UndoAction) => void;
  undo: () => UndoAction | null;
  redo: () => UndoAction | null;
  showToast: () => void;
  hideToast: () => void;
  clearStacks: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  showUndoToast: false,
  lastAction: null,

  pushUndo: (action) => set((state) => ({
    undoStack: [...state.undoStack.slice(-19), action], // Keep last 20
    redoStack: [], // Clear redo stack on new action
    lastAction: action,
    showUndoToast: true,
  })),

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return null;

    const action = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, action],
      showUndoToast: false,
    });
    return action;
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;

    const action = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, action],
    });
    return action;
  },

  showToast: () => set({ showUndoToast: true }),
  hideToast: () => set({ showUndoToast: false }),
  clearStacks: () => set({ undoStack: [], redoStack: [], lastAction: null }),
}));

// Notifications State
interface NotificationState {
  unreadCount: number;
  showPanel: boolean;
  setUnreadCount: (count: number) => void;
  togglePanel: () => void;
  closePanel: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  showPanel: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  togglePanel: () => set((state) => ({ showPanel: !state.showPanel })),
  closePanel: () => set({ showPanel: false }),
}));
