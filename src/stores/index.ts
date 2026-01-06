import { create } from 'zustand';
import type { ItemWithRelations, ItemFilters } from '../types/supabase';

// Uma Musume Character Themes
export interface UmaTheme {
  id: string;
  name: string;
  character: string;
  description: string;
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    sidebar: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    highlight: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    sidebar: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    highlight: string;
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
    light: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      background: '#F9FAFB',
      sidebar: '#1F2937',
      card: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      highlight: '#EFF6FF',
    },
    dark: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      background: '#111827',
      sidebar: '#0F172A',
      card: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      highlight: '#1E3A8A',
    },
    fontFamily: 'system-ui, -apple-system, sans-serif',
    iconStyle: 'modern',
  },
  {
    id: 'silence-suzuka',
    name: 'Silence Suzuka',
    character: 'サイレンススズカ',
    description: 'Elegant and swift, like the wind',
    light: {
      primary: '#059669',
      secondary: '#F97316',
      accent: '#10B981',
      background: '#F0FDF4',
      sidebar: '#064E3B',
      card: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#A7F3D0',
      highlight: '#D1FAE5',
    },
    dark: {
      primary: '#10B981',
      secondary: '#FB923C',
      accent: '#34D399',
      background: '#022C22',
      sidebar: '#011612',
      card: '#064E3B',
      text: '#ECFDF5',
      textSecondary: '#6EE7B7',
      border: '#065F46',
      highlight: '#047857',
    },
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    iconStyle: 'elegant',
  },
  {
    id: 'special-week',
    name: 'Special Week',
    character: 'スペシャルウィーク',
    description: 'Purple and pink champion spirit',
    light: {
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#A855F7',
      background: '#FAF5FF',
      sidebar: '#581C87',
      card: '#FFFFFF',
      text: '#3B0764',
      textSecondary: '#7C3AED',
      border: '#E9D5FF',
      highlight: '#F3E8FF',
    },
    dark: {
      primary: '#A855F7',
      secondary: '#F472B6',
      accent: '#C084FC',
      background: '#1E1033',
      sidebar: '#13082B',
      card: '#2E1065',
      text: '#FAF5FF',
      textSecondary: '#C4B5FD',
      border: '#581C87',
      highlight: '#6B21A8',
    },
    fontFamily: '"Nunito", "Comic Sans MS", sans-serif',
    iconStyle: 'playful',
  },
  {
    id: 'tokai-teio',
    name: 'Tokai Teio',
    character: 'トウカイテイオー',
    description: 'Emperor\'s white and royal blue',
    light: {
      primary: '#2563EB',
      secondary: '#EC4899',
      accent: '#3B82F6',
      background: '#F8FAFC',
      sidebar: '#1E3A8A',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#F472B6',
      accent: '#93C5FD',
      background: '#0C1929',
      sidebar: '#071224',
      card: '#1E3A8A',
      text: '#F0F9FF',
      textSecondary: '#93C5FD',
      border: '#1D4ED8',
      highlight: '#1E40AF',
    },
    fontFamily: '"Playfair Display", Georgia, serif',
    iconStyle: 'bold',
  },
  {
    id: 'mejiro-mcqueen',
    name: 'Mejiro McQueen',
    character: 'メジロマックイーン',
    description: 'Noble purple elegance',
    light: {
      primary: '#7C3AED',
      secondary: '#E9D5FF',
      accent: '#8B5CF6',
      background: '#FAFAFA',
      sidebar: '#4C1D95',
      card: '#FFFFFF',
      text: '#4C1D95',
      textSecondary: '#6D28D9',
      border: '#DDD6FE',
      highlight: '#EDE9FE',
    },
    dark: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      accent: '#8B5CF6',
      background: '#1A0F2E',
      sidebar: '#0F0720',
      card: '#2E1065',
      text: '#F5F3FF',
      textSecondary: '#C4B5FD',
      border: '#5B21B6',
      highlight: '#4C1D95',
    },
    fontFamily: '"Libre Baskerville", "Times New Roman", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'rice-shower',
    name: 'Rice Shower',
    character: 'ライスシャワー',
    description: 'Gentle dark beauty',
    light: {
      primary: '#1F2937',
      secondary: '#9333EA',
      accent: '#4B5563',
      background: '#F9FAFB',
      sidebar: '#111827',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#D1D5DB',
      highlight: '#F3F4F6',
    },
    dark: {
      primary: '#9CA3AF',
      secondary: '#A855F7',
      accent: '#D1D5DB',
      background: '#0A0A0B',
      sidebar: '#050506',
      card: '#18181B',
      text: '#FAFAFA',
      textSecondary: '#A1A1AA',
      border: '#27272A',
      highlight: '#1F2937',
    },
    fontFamily: '"EB Garamond", Georgia, serif',
    iconStyle: 'soft',
  },
  {
    id: 'gold-ship',
    name: 'Gold Ship',
    character: 'ゴールドシップ',
    description: 'Chaotic red and white energy',
    light: {
      primary: '#DC2626',
      secondary: '#FAFAFA',
      accent: '#EF4444',
      background: '#FEF2F2',
      sidebar: '#7F1D1D',
      card: '#FFFFFF',
      text: '#7F1D1D',
      textSecondary: '#B91C1C',
      border: '#FECACA',
      highlight: '#FEE2E2',
    },
    dark: {
      primary: '#F87171',
      secondary: '#FAFAFA',
      accent: '#EF4444',
      background: '#1C0A0A',
      sidebar: '#120505',
      card: '#450A0A',
      text: '#FEF2F2',
      textSecondary: '#FCA5A5',
      border: '#7F1D1D',
      highlight: '#991B1B',
    },
    fontFamily: '"Fredoka One", "Comic Sans MS", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'vodka',
    name: 'Vodka',
    character: 'ウオッカ',
    description: 'Cool black and yellow spirit',
    light: {
      primary: '#1F2937',
      secondary: '#FBBF24',
      accent: '#F59E0B',
      background: '#FEFCE8',
      sidebar: '#111827',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#FEF3C7',
      highlight: '#FEF9C3',
    },
    dark: {
      primary: '#FBBF24',
      secondary: '#FCD34D',
      accent: '#F59E0B',
      background: '#0F0F0A',
      sidebar: '#0A0A07',
      card: '#1C1917',
      text: '#FEFCE8',
      textSecondary: '#FDE68A',
      border: '#422006',
      highlight: '#365314',
    },
    fontFamily: '"Roboto Condensed", Arial, sans-serif',
    iconStyle: 'bold',
  },
  {
    id: 'daiwa-scarlet',
    name: 'Daiwa Scarlet',
    character: 'ダイワスカーレット',
    description: 'Passionate blue and white flame',
    light: {
      primary: '#1D4ED8',
      secondary: '#FFFFFF',
      accent: '#2563EB',
      background: '#EFF6FF',
      sidebar: '#1E3A8A',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#F1F5F9',
      accent: '#3B82F6',
      background: '#0C1524',
      sidebar: '#061022',
      card: '#172554',
      text: '#EFF6FF',
      textSecondary: '#93C5FD',
      border: '#1E40AF',
      highlight: '#1D4ED8',
    },
    fontFamily: '"Lora", Georgia, serif',
    iconStyle: 'bold',
  },
  {
    id: 'grass-wonder',
    name: 'Grass Wonder',
    character: 'グラスワンダー',
    description: 'Serene forest wanderer',
    light: {
      primary: '#16A34A',
      secondary: '#84CC16',
      accent: '#22C55E',
      background: '#F0FDF4',
      sidebar: '#14532D',
      card: '#FFFFFF',
      text: '#14532D',
      textSecondary: '#16A34A',
      border: '#BBF7D0',
      highlight: '#DCFCE7',
    },
    dark: {
      primary: '#4ADE80',
      secondary: '#A3E635',
      accent: '#22C55E',
      background: '#052E16',
      sidebar: '#022C22',
      card: '#14532D',
      text: '#F0FDF4',
      textSecondary: '#86EFAC',
      border: '#166534',
      highlight: '#15803D',
    },
    fontFamily: '"Merriweather", Georgia, serif',
    iconStyle: 'soft',
  },
  {
    id: 'symboli-rudolf',
    name: 'Symboli Rudolf',
    character: 'シンボリルドルフ',
    description: 'The absolute emperor in dark green',
    light: {
      primary: '#166534',
      secondary: '#15803D',
      accent: '#14532D',
      background: '#F0FDF4',
      sidebar: '#052E16',
      card: '#FFFFFF',
      text: '#052E16',
      textSecondary: '#166534',
      border: '#BBF7D0',
      highlight: '#DCFCE7',
    },
    dark: {
      primary: '#22C55E',
      secondary: '#4ADE80',
      accent: '#16A34A',
      background: '#021A0D',
      sidebar: '#01120A',
      card: '#052E16',
      text: '#ECFDF5',
      textSecondary: '#86EFAC',
      border: '#14532D',
      highlight: '#166534',
    },
    fontFamily: '"Cinzel", "Times New Roman", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'oguri-cap',
    name: 'Oguri Cap',
    character: 'オグリキャップ',
    description: 'Ashen legend with golden spirit',
    light: {
      primary: '#6B7280',
      secondary: '#FBBF24',
      accent: '#9CA3AF',
      background: '#F9FAFB',
      sidebar: '#374151',
      card: '#FFFFFF',
      text: '#374151',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      highlight: '#F3F4F6',
    },
    dark: {
      primary: '#9CA3AF',
      secondary: '#FCD34D',
      accent: '#D1D5DB',
      background: '#111214',
      sidebar: '#0A0B0C',
      card: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151',
      highlight: '#4B5563',
    },
    fontFamily: '"Quicksand", Arial, sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'mihono-bourbon',
    name: 'Mihono Bourbon',
    character: 'ミホノブルボン',
    description: 'Cybernetic orange precision',
    light: {
      primary: '#EA580C',
      secondary: '#FFFFFF',
      accent: '#F97316',
      background: '#FFF7ED',
      sidebar: '#7C2D12',
      card: '#FFFFFF',
      text: '#7C2D12',
      textSecondary: '#C2410C',
      border: '#FED7AA',
      highlight: '#FFEDD5',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#FED7AA',
      accent: '#F97316',
      background: '#1A0F08',
      sidebar: '#120A05',
      card: '#431407',
      text: '#FFF7ED',
      textSecondary: '#FDBA74',
      border: '#7C2D12',
      highlight: '#9A3412',
    },
    fontFamily: '"Orbitron", "Courier New", monospace',
    iconStyle: 'modern',
  },
  {
    id: 'agnes-tachyon',
    name: 'Agnes Tachyon',
    character: 'アグネスタキオン',
    description: 'Mad scientist purple genius',
    light: {
      primary: '#7C3AED',
      secondary: '#F5F5F4',
      accent: '#8B5CF6',
      background: '#FAF5FF',
      sidebar: '#4C1D95',
      card: '#FFFFFF',
      text: '#3B0764',
      textSecondary: '#6D28D9',
      border: '#DDD6FE',
      highlight: '#EDE9FE',
    },
    dark: {
      primary: '#A78BFA',
      secondary: '#E7E5E4',
      accent: '#8B5CF6',
      background: '#14081F',
      sidebar: '#0C0514',
      card: '#2E1065',
      text: '#FAF5FF',
      textSecondary: '#C4B5FD',
      border: '#5B21B6',
      highlight: '#6D28D9',
    },
    fontFamily: '"Fira Code", "Courier New", monospace',
    iconStyle: 'modern',
  },
  {
    id: 'narita-brian',
    name: 'Narita Brian',
    character: 'ナリタブライアン',
    description: 'Shadow warrior in red and black',
    light: {
      primary: '#B91C1C',
      secondary: '#1F2937',
      accent: '#DC2626',
      background: '#FEF2F2',
      sidebar: '#1F2937',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#991B1B',
      border: '#FECACA',
      highlight: '#FEE2E2',
    },
    dark: {
      primary: '#EF4444',
      secondary: '#374151',
      accent: '#F87171',
      background: '#0F0808',
      sidebar: '#0A0505',
      card: '#1C1414',
      text: '#FEF2F2',
      textSecondary: '#FCA5A5',
      border: '#450A0A',
      highlight: '#7F1D1D',
    },
    fontFamily: '"Bebas Neue", Impact, sans-serif',
    iconStyle: 'bold',
  },
  {
    id: 'hishi-amazon',
    name: 'Hishi Amazon',
    character: 'ヒシアマゾン',
    description: 'Wild yellow tribal warrior',
    light: {
      primary: '#CA8A04',
      secondary: '#292524',
      accent: '#EAB308',
      background: '#FEFCE8',
      sidebar: '#422006',
      card: '#FFFFFF',
      text: '#422006',
      textSecondary: '#A16207',
      border: '#FEF08A',
      highlight: '#FEF9C3',
    },
    dark: {
      primary: '#FACC15',
      secondary: '#44403C',
      accent: '#FDE047',
      background: '#141008',
      sidebar: '#0D0A05',
      card: '#292524',
      text: '#FEFCE8',
      textSecondary: '#FDE047',
      border: '#713F12',
      highlight: '#854D0E',
    },
    fontFamily: '"Righteous", cursive',
    iconStyle: 'bold',
  },
  {
    id: 'seiun-sky',
    name: 'Seiun Sky',
    character: 'セイウンスカイ',
    description: 'Mischievous light blue trickster',
    light: {
      primary: '#0EA5E9',
      secondary: '#F0F9FF',
      accent: '#38BDF8',
      background: '#F0F9FF',
      sidebar: '#0C4A6E',
      card: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#0284C7',
      border: '#BAE6FD',
      highlight: '#E0F2FE',
    },
    dark: {
      primary: '#38BDF8',
      secondary: '#082F49',
      accent: '#7DD3FC',
      background: '#051525',
      sidebar: '#030E17',
      card: '#0C4A6E',
      text: '#F0F9FF',
      textSecondary: '#7DD3FC',
      border: '#075985',
      highlight: '#0369A1',
    },
    fontFamily: '"Baloo 2", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'sakura-bakushin-o',
    name: 'Sakura Bakushin O',
    character: 'サクラバクシンオー',
    description: 'Explosive pink speed demon',
    light: {
      primary: '#DB2777',
      secondary: '#FFFFFF',
      accent: '#EC4899',
      background: '#FDF2F8',
      sidebar: '#831843',
      card: '#FFFFFF',
      text: '#831843',
      textSecondary: '#BE185D',
      border: '#FBCFE8',
      highlight: '#FCE7F3',
    },
    dark: {
      primary: '#F472B6',
      secondary: '#FDF2F8',
      accent: '#EC4899',
      background: '#1A0812',
      sidebar: '#12050C',
      card: '#500724',
      text: '#FDF2F8',
      textSecondary: '#F9A8D4',
      border: '#9D174D',
      highlight: '#BE185D',
    },
    fontFamily: '"Pacifico", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'smart-falcon',
    name: 'Smart Falcon',
    character: 'スマートファルコン',
    description: 'Dazzling idol blue star',
    light: {
      primary: '#2563EB',
      secondary: '#FDE68A',
      accent: '#3B82F6',
      background: '#EFF6FF',
      sidebar: '#1E40AF',
      card: '#FFFFFF',
      text: '#1E40AF',
      textSecondary: '#2563EB',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#FBBF24',
      accent: '#93C5FD',
      background: '#0B1629',
      sidebar: '#070F1D',
      card: '#1E3A8A',
      text: '#EFF6FF',
      textSecondary: '#93C5FD',
      border: '#1D4ED8',
      highlight: '#1E40AF',
    },
    fontFamily: '"Poppins", sans-serif',
    iconStyle: 'modern',
  },
  {
    id: 'curren-chan',
    name: 'Curren Chan',
    character: 'カレンチャン',
    description: 'Sweet pink and blue idol',
    light: {
      primary: '#EC4899',
      secondary: '#67E8F9',
      accent: '#F472B6',
      background: '#FDF2F8',
      sidebar: '#9D174D',
      card: '#FFFFFF',
      text: '#831843',
      textSecondary: '#DB2777',
      border: '#FBCFE8',
      highlight: '#FCE7F3',
    },
    dark: {
      primary: '#F472B6',
      secondary: '#22D3EE',
      accent: '#F9A8D4',
      background: '#1A0A14',
      sidebar: '#12060D',
      card: '#500724',
      text: '#FDF2F8',
      textSecondary: '#F9A8D4',
      border: '#831843',
      highlight: '#9D174D',
    },
    fontFamily: '"Quicksand", sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'twin-turbo',
    name: 'Twin Turbo',
    character: 'ツインターボ',
    description: 'Never give up orange spirit',
    light: {
      primary: '#EA580C',
      secondary: '#FEF3C7',
      accent: '#F97316',
      background: '#FFF7ED',
      sidebar: '#9A3412',
      card: '#FFFFFF',
      text: '#7C2D12',
      textSecondary: '#C2410C',
      border: '#FED7AA',
      highlight: '#FFEDD5',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#FDE68A',
      accent: '#FDBA74',
      background: '#1A0D05',
      sidebar: '#110903',
      card: '#431407',
      text: '#FFF7ED',
      textSecondary: '#FDBA74',
      border: '#7C2D12',
      highlight: '#9A3412',
    },
    fontFamily: '"Bangers", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'nice-nature',
    name: 'Nice Nature',
    character: 'ナイスネイチャー',
    description: 'Gentle green third place charm',
    light: {
      primary: '#059669',
      secondary: '#FCD34D',
      accent: '#10B981',
      background: '#ECFDF5',
      sidebar: '#065F46',
      card: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#A7F3D0',
      highlight: '#D1FAE5',
    },
    dark: {
      primary: '#34D399',
      secondary: '#FBBF24',
      accent: '#6EE7B7',
      background: '#051F15',
      sidebar: '#03140D',
      card: '#064E3B',
      text: '#ECFDF5',
      textSecondary: '#6EE7B7',
      border: '#047857',
      highlight: '#059669',
    },
    fontFamily: '"Nunito Sans", sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'mayano-top-gun',
    name: 'Mayano Top Gun',
    character: 'マヤノトップガン',
    description: 'Playful orange aviator',
    light: {
      primary: '#F97316',
      secondary: '#1E3A8A',
      accent: '#FB923C',
      background: '#FFF7ED',
      sidebar: '#C2410C',
      card: '#FFFFFF',
      text: '#7C2D12',
      textSecondary: '#EA580C',
      border: '#FDBA74',
      highlight: '#FFEDD5',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#3B82F6',
      accent: '#FDBA74',
      background: '#180E05',
      sidebar: '#0F0903',
      card: '#431407',
      text: '#FFFBEB',
      textSecondary: '#FED7AA',
      border: '#9A3412',
      highlight: '#C2410C',
    },
    fontFamily: '"Russo One", sans-serif',
    iconStyle: 'bold',
  },
];

// Helper to get theme colors based on dark mode
export const getThemeColors = (theme: UmaTheme, isDarkMode: boolean) => {
  return isDarkMode ? theme.dark : theme.light;
};

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
