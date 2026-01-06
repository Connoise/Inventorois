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
      primary: '#60A5FA',
      secondary: '#818CF8',
      accent: '#A78BFA',
      background: '#111827',
      sidebar: '#0F172A',
      card: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151',
      highlight: '#1E3A8A',
    },
    fontFamily: 'system-ui, -apple-system, sans-serif',
    iconStyle: 'modern',
  },
  {
    id: 'special-week',
    name: 'Special Week',
    character: 'スペシャルウィーク',
    description: 'The Thoroughbred of Dreams',
    light: {
      primary: '#5C3A7A',
      secondary: '#D687C8',
      accent: '#A27361',
      background: '#FAF5FF',
      sidebar: '#5C3A7A',
      card: '#FFFFFF',
      text: '#3B0764',
      textSecondary: '#6B21A8',
      border: '#E9D5FF',
      highlight: '#F3E8FF',
    },
    dark: {
      primary: '#D687C8',
      secondary: '#A855F7',
      accent: '#C4B5FD',
      background: '#1E1033',
      sidebar: '#2E1065',
      card: '#3B0764',
      text: '#FAF5FF',
      textSecondary: '#E9D5FF',
      border: '#581C87',
      highlight: '#4C1D95',
    },
    fontFamily: '"Nunito", sans-serif',
    iconStyle: 'playful',
  },
  {
    id: 'tokai-teio',
    name: 'Tokai Teio',
    character: 'トウカイテイオー',
    description: 'The Unbreakable Ace',
    light: {
      primary: '#0033CC',
      secondary: '#D20F39',
      accent: '#C3792B',
      background: '#EFF6FF',
      sidebar: '#0033CC',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#F87171',
      accent: '#FBBF24',
      background: '#0C1929',
      sidebar: '#1E3A8A',
      card: '#172554',
      text: '#F0F9FF',
      textSecondary: '#BFDBFE',
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
    description: 'The Dignified White Queen',
    light: {
      primary: '#7F7FFF',
      secondary: '#C0A3E2',
      accent: '#C0A3E2',
      background: '#FAFAFA',
      sidebar: '#5B21B6',
      card: '#FFFFFF',
      text: '#4C1D95',
      textSecondary: '#6D28D9',
      border: '#DDD6FE',
      highlight: '#EDE9FE',
    },
    dark: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      accent: '#DDD6FE',
      background: '#1A0F2E',
      sidebar: '#2E1065',
      card: '#3B0764',
      text: '#F5F3FF',
      textSecondary: '#DDD6FE',
      border: '#5B21B6',
      highlight: '#4C1D95',
    },
    fontFamily: '"Libre Baskerville", "Times New Roman", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'gold-ship',
    name: 'Gold Ship',
    character: 'ゴールドシップ',
    description: 'The Mischievous Meteor',
    light: {
      primary: '#000000',
      secondary: '#D4AF37',
      accent: '#1F2937',
      background: '#FFFBEB',
      sidebar: '#000000',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#FDE68A',
      highlight: '#FEF3C7',
    },
    dark: {
      primary: '#D4AF37',
      secondary: '#FCD34D',
      accent: '#FBBF24',
      background: '#0F0F0A',
      sidebar: '#1C1917',
      card: '#292524',
      text: '#FEFCE8',
      textSecondary: '#FDE68A',
      border: '#422006',
      highlight: '#3F3F46',
    },
    fontFamily: '"Fredoka One", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'vodka',
    name: 'Vodka',
    character: 'ウオッカ',
    description: 'The Cool-Speed Star',
    light: {
      primary: '#00008B',
      secondary: '#D3D3D3',
      accent: '#1A1A1A',
      background: '#F8FAFC',
      sidebar: '#00008B',
      card: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#475569',
      border: '#CBD5E1',
      highlight: '#F1F5F9',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#E2E8F0',
      accent: '#94A3B8',
      background: '#0F172A',
      sidebar: '#1E3A8A',
      card: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      highlight: '#1E3A8A',
    },
    fontFamily: '"Roboto Condensed", Arial, sans-serif',
    iconStyle: 'bold',
  },
  {
    id: 'daiwa-scarlet',
    name: 'Daiwa Scarlet',
    character: 'ダイワスカーレット',
    description: 'The Fiery High-Speed Idol',
    light: {
      primary: '#000080',
      secondary: '#FFD700',
      accent: '#A13933',
      background: '#EFF6FF',
      sidebar: '#000080',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#FCD34D',
      accent: '#F87171',
      background: '#0C1524',
      sidebar: '#1E3A8A',
      card: '#172554',
      text: '#EFF6FF',
      textSecondary: '#BFDBFE',
      border: '#1E40AF',
      highlight: '#1D4ED8',
    },
    fontFamily: '"Lora", Georgia, serif',
    iconStyle: 'bold',
  },
  {
    id: 'symboli-rudolf',
    name: 'Symboli Rudolf',
    character: 'シンボリルドルフ',
    description: 'The Emperor',
    light: {
      primary: '#013220',
      secondary: '#C8102E',
      accent: '#8B5E3C',
      background: '#F0FDF4',
      sidebar: '#013220',
      card: '#FFFFFF',
      text: '#052E16',
      textSecondary: '#166534',
      border: '#BBF7D0',
      highlight: '#DCFCE7',
    },
    dark: {
      primary: '#4ADE80',
      secondary: '#F87171',
      accent: '#FBBF24',
      background: '#021A0D',
      sidebar: '#052E16',
      card: '#14532D',
      text: '#ECFDF5',
      textSecondary: '#BBF7D0',
      border: '#166534',
      highlight: '#15803D',
    },
    fontFamily: '"Cinzel", "Times New Roman", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'oguri-cap',
    name: 'Oguri Cap',
    character: 'オグリキャップ',
    description: 'The White Wonder',
    light: {
      primary: '#000000',
      secondary: '#DA1212',
      accent: '#6B7280',
      background: '#F9FAFB',
      sidebar: '#1F2937',
      card: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#4B5563',
      border: '#E5E7EB',
      highlight: '#F3F4F6',
    },
    dark: {
      primary: '#E5E7EB',
      secondary: '#F87171',
      accent: '#9CA3AF',
      background: '#111214',
      sidebar: '#1F2937',
      card: '#27272A',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#3F3F46',
      highlight: '#374151',
    },
    fontFamily: '"Quicksand", Arial, sans-serif',
    iconStyle: 'soft',
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
      primary: '#34D399',
      secondary: '#FB923C',
      accent: '#6EE7B7',
      background: '#022C22',
      sidebar: '#064E3B',
      card: '#065F46',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#047857',
      highlight: '#059669',
    },
    fontFamily: '"Cormorant Garamond", Georgia, serif',
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
      primary: '#A78BFA',
      secondary: '#C084FC',
      accent: '#D1D5DB',
      background: '#0A0A0B',
      sidebar: '#18181B',
      card: '#27272A',
      text: '#FAFAFA',
      textSecondary: '#D4D4D8',
      border: '#3F3F46',
      highlight: '#27272A',
    },
    fontFamily: '"EB Garamond", Georgia, serif',
    iconStyle: 'soft',
  },
  {
    id: 'mihono-bourbon',
    name: 'Mihono Bourbon',
    character: 'ミホノブルボン',
    description: 'The Cybernetic Speedster',
    light: {
      primary: '#800020',
      secondary: '#5A0F0F',
      accent: '#3C1414',
      background: '#FEF2F2',
      sidebar: '#800020',
      card: '#FFFFFF',
      text: '#7F1D1D',
      textSecondary: '#991B1B',
      border: '#FECACA',
      highlight: '#FEE2E2',
    },
    dark: {
      primary: '#F87171',
      secondary: '#FCA5A5',
      accent: '#FECACA',
      background: '#1A0808',
      sidebar: '#450A0A',
      card: '#7F1D1D',
      text: '#FEF2F2',
      textSecondary: '#FECACA',
      border: '#991B1B',
      highlight: '#7F1D1D',
    },
    fontFamily: '"Orbitron", "Courier New", monospace',
    iconStyle: 'modern',
  },
  {
    id: 'agnes-tachyon',
    name: 'Agnes Tachyon',
    character: 'アグネスタキオン',
    description: 'The Unstoppable Genius',
    light: {
      primary: '#00CED1',
      secondary: '#009AA0',
      accent: '#FFFFFF',
      background: '#ECFEFF',
      sidebar: '#0E7490',
      card: '#FFFFFF',
      text: '#164E63',
      textSecondary: '#0891B2',
      border: '#A5F3FC',
      highlight: '#CFFAFE',
    },
    dark: {
      primary: '#22D3EE',
      secondary: '#67E8F9',
      accent: '#A5F3FC',
      background: '#051B21',
      sidebar: '#164E63',
      card: '#155E75',
      text: '#ECFEFF',
      textSecondary: '#A5F3FC',
      border: '#0E7490',
      highlight: '#0891B2',
    },
    fontFamily: '"Fira Code", "Courier New", monospace',
    iconStyle: 'modern',
  },
  {
    id: 'narita-brian',
    name: 'Narita Brian',
    character: 'ナリタブライアン',
    description: 'The Jet-Black Triple Crown',
    light: {
      primary: '#800000',
      secondary: '#000000',
      accent: '#4F0A0A',
      background: '#FEF2F2',
      sidebar: '#1C1917',
      card: '#FFFFFF',
      text: '#1C1917',
      textSecondary: '#57534E',
      border: '#D6D3D1',
      highlight: '#F5F5F4',
    },
    dark: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5',
      background: '#0C0A09',
      sidebar: '#1C1917',
      card: '#292524',
      text: '#FAFAF9',
      textSecondary: '#D6D3D1',
      border: '#44403C',
      highlight: '#3F3F46',
    },
    fontFamily: '"Bebas Neue", Impact, sans-serif',
    iconStyle: 'bold',
  },
  {
    id: 'hishi-amazon',
    name: 'Hishi Amazon',
    character: 'ヒシアマゾン',
    description: 'The Wild Amazoness',
    light: {
      primary: '#008000',
      secondary: '#FFD700',
      accent: '#004F00',
      background: '#F0FDF4',
      sidebar: '#166534',
      card: '#FFFFFF',
      text: '#14532D',
      textSecondary: '#166534',
      border: '#BBF7D0',
      highlight: '#DCFCE7',
    },
    dark: {
      primary: '#4ADE80',
      secondary: '#FACC15',
      accent: '#86EFAC',
      background: '#052E16',
      sidebar: '#14532D',
      card: '#166534',
      text: '#F0FDF4',
      textSecondary: '#BBF7D0',
      border: '#15803D',
      highlight: '#166534',
    },
    fontFamily: '"Righteous", cursive',
    iconStyle: 'bold',
  },
  {
    id: 'seiun-sky',
    name: 'Seiun Sky',
    character: 'セイウンスカイ',
    description: 'The Trickster of the Heavens',
    light: {
      primary: '#87CEEB',
      secondary: '#6BB7D5',
      accent: '#ADD8E6',
      background: '#F0F9FF',
      sidebar: '#0369A1',
      card: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#0284C7',
      border: '#BAE6FD',
      highlight: '#E0F2FE',
    },
    dark: {
      primary: '#7DD3FC',
      secondary: '#38BDF8',
      accent: '#BAE6FD',
      background: '#051525',
      sidebar: '#0C4A6E',
      card: '#075985',
      text: '#F0F9FF',
      textSecondary: '#BAE6FD',
      border: '#0369A1',
      highlight: '#0284C7',
    },
    fontFamily: '"Baloo 2", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'sakura-bakushin-o',
    name: 'Sakura Bakushin O',
    character: 'サクラバクシンオー',
    description: 'The High-Speed Bakushin',
    light: {
      primary: '#FF69B4',
      secondary: '#FF8CCF',
      accent: '#F8BBD0',
      background: '#FDF2F8',
      sidebar: '#BE185D',
      card: '#FFFFFF',
      text: '#831843',
      textSecondary: '#BE185D',
      border: '#FBCFE8',
      highlight: '#FCE7F3',
    },
    dark: {
      primary: '#F472B6',
      secondary: '#F9A8D4',
      accent: '#FBCFE8',
      background: '#1A0812',
      sidebar: '#831843',
      card: '#9D174D',
      text: '#FDF2F8',
      textSecondary: '#FBCFE8',
      border: '#BE185D',
      highlight: '#9D174D',
    },
    fontFamily: '"Pacifico", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'smart-falcon',
    name: 'Smart Falcon',
    character: 'スマートファルコン',
    description: 'The Galactical Dirt Queen',
    light: {
      primary: '#8B0000',
      secondary: '#000000',
      accent: '#5A0000',
      background: '#FEF2F2',
      sidebar: '#7F1D1D',
      card: '#FFFFFF',
      text: '#7F1D1D',
      textSecondary: '#991B1B',
      border: '#FECACA',
      highlight: '#FEE2E2',
    },
    dark: {
      primary: '#F87171',
      secondary: '#FCA5A5',
      accent: '#FECACA',
      background: '#1A0505',
      sidebar: '#450A0A',
      card: '#7F1D1D',
      text: '#FEF2F2',
      textSecondary: '#FECACA',
      border: '#991B1B',
      highlight: '#7F1D1D',
    },
    fontFamily: '"Poppins", sans-serif',
    iconStyle: 'modern',
  },
  {
    id: 'curren-chan',
    name: 'Curren Chan',
    character: 'カレンチャン',
    description: 'The Fluffy Sprinter',
    light: {
      primary: '#DC143C',
      secondary: '#B01030',
      accent: '#DC143C',
      background: '#FEF2F2',
      sidebar: '#9F1239',
      card: '#FFFFFF',
      text: '#881337',
      textSecondary: '#BE123C',
      border: '#FECDD3',
      highlight: '#FFE4E6',
    },
    dark: {
      primary: '#FB7185',
      secondary: '#FDA4AF',
      accent: '#FECDD3',
      background: '#1A0A0E',
      sidebar: '#881337',
      card: '#9F1239',
      text: '#FFF1F2',
      textSecondary: '#FECDD3',
      border: '#BE123C',
      highlight: '#9F1239',
    },
    fontFamily: '"Quicksand", sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'twin-turbo',
    name: 'Twin Turbo',
    character: 'ツインターボ',
    description: 'The Turbo Disaster Star',
    light: {
      primary: '#1E90FF',
      secondary: '#1465B2',
      accent: '#1E90FF',
      background: '#EFF6FF',
      sidebar: '#1E40AF',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#2563EB',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#93C5FD',
      accent: '#BFDBFE',
      background: '#0B1629',
      sidebar: '#1E3A8A',
      card: '#1D4ED8',
      text: '#EFF6FF',
      textSecondary: '#BFDBFE',
      border: '#2563EB',
      highlight: '#1E40AF',
    },
    fontFamily: '"Bangers", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'nice-nature',
    name: 'Nice Nature',
    character: 'ナイスネイチャ',
    description: 'The Emerald of Good Luck',
    light: {
      primary: '#228B22',
      secondary: '#175F17',
      accent: '#A2CFA5',
      background: '#ECFDF5',
      sidebar: '#166534',
      card: '#FFFFFF',
      text: '#14532D',
      textSecondary: '#166534',
      border: '#A7F3D0',
      highlight: '#D1FAE5',
    },
    dark: {
      primary: '#4ADE80',
      secondary: '#86EFAC',
      accent: '#BBF7D0',
      background: '#051F15',
      sidebar: '#14532D',
      card: '#166534',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#15803D',
      highlight: '#166534',
    },
    fontFamily: '"Nunito Sans", sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'mayano-top-gun',
    name: 'Mayano Top Gun',
    character: 'マヤノトップガン',
    description: 'The Soaring Flame',
    light: {
      primary: '#FF4500',
      secondary: '#CC3700',
      accent: '#FF7F50',
      background: '#FFF7ED',
      sidebar: '#C2410C',
      card: '#FFFFFF',
      text: '#7C2D12',
      textSecondary: '#EA580C',
      border: '#FED7AA',
      highlight: '#FFEDD5',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#FDBA74',
      accent: '#FED7AA',
      background: '#180E05',
      sidebar: '#7C2D12',
      card: '#9A3412',
      text: '#FFF7ED',
      textSecondary: '#FED7AA',
      border: '#C2410C',
      highlight: '#9A3412',
    },
    fontFamily: '"Russo One", sans-serif',
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
      accent: '#86EFAC',
      background: '#052E16',
      sidebar: '#14532D',
      card: '#166534',
      text: '#F0FDF4',
      textSecondary: '#BBF7D0',
      border: '#15803D',
      highlight: '#166534',
    },
    fontFamily: '"Merriweather", Georgia, serif',
    iconStyle: 'soft',
  },
  {
    id: 'air-groove',
    name: 'Air Groove',
    character: 'エアグルーヴ',
    description: 'The Steel Empress',
    light: {
      primary: '#800080',
      secondary: '#4B004B',
      accent: '#800080',
      background: '#FAF5FF',
      sidebar: '#581C87',
      card: '#FFFFFF',
      text: '#3B0764',
      textSecondary: '#6B21A8',
      border: '#E9D5FF',
      highlight: '#F3E8FF',
    },
    dark: {
      primary: '#C084FC',
      secondary: '#D8B4FE',
      accent: '#E9D5FF',
      background: '#14081F',
      sidebar: '#3B0764',
      card: '#581C87',
      text: '#FAF5FF',
      textSecondary: '#E9D5FF',
      border: '#6B21A8',
      highlight: '#581C87',
    },
    fontFamily: '"Cinzel", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'tm-opera-o',
    name: 'TM Opera O',
    character: 'テイエムオペラオー',
    description: 'The Perfect Champion',
    light: {
      primary: '#800080',
      secondary: '#5A0066',
      accent: '#483060',
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
      secondary: '#C4B5FD',
      accent: '#DDD6FE',
      background: '#14081F',
      sidebar: '#2E1065',
      card: '#4C1D95',
      text: '#F5F3FF',
      textSecondary: '#DDD6FE',
      border: '#5B21B6',
      highlight: '#4C1D95',
    },
    fontFamily: '"Playfair Display", serif',
    iconStyle: 'elegant',
  },
  {
    id: 'meisho-doto',
    name: 'Meisho Doto',
    character: 'メイショウドトウ',
    description: 'The Reluctant Warrior',
    light: {
      primary: '#DC143C',
      secondary: '#FFD700',
      accent: '#9E0F28',
      background: '#FEF2F2',
      sidebar: '#9F1239',
      card: '#FFFFFF',
      text: '#7F1D1D',
      textSecondary: '#B91C1C',
      border: '#FECACA',
      highlight: '#FEE2E2',
    },
    dark: {
      primary: '#F87171',
      secondary: '#FCD34D',
      accent: '#FCA5A5',
      background: '#1A0808',
      sidebar: '#7F1D1D',
      card: '#991B1B',
      text: '#FEF2F2',
      textSecondary: '#FECACA',
      border: '#B91C1C',
      highlight: '#7F1D1D',
    },
    fontFamily: '"Nunito", sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'kitasan-black',
    name: 'Kitasan Black',
    character: 'キタサンブラック',
    description: 'The Northern Black Lightning',
    light: {
      primary: '#000000',
      secondary: '#FFD700',
      accent: '#1F2937',
      background: '#F9FAFB',
      sidebar: '#111827',
      card: '#FFFFFF',
      text: '#111827',
      textSecondary: '#374151',
      border: '#E5E7EB',
      highlight: '#F3F4F6',
    },
    dark: {
      primary: '#FCD34D',
      secondary: '#FBBF24',
      accent: '#FDE68A',
      background: '#0A0A0B',
      sidebar: '#18181B',
      card: '#27272A',
      text: '#FAFAFA',
      textSecondary: '#E4E4E7',
      border: '#3F3F46',
      highlight: '#27272A',
    },
    fontFamily: '"Bebas Neue", Impact, sans-serif',
    iconStyle: 'bold',
  },
  {
    id: 'daitaku-helios',
    name: 'Daitaku Helios',
    character: 'ダイタクヘリオス',
    description: 'The Burning City Light',
    light: {
      primary: '#FFA500',
      secondary: '#CC8400',
      accent: '#A65E00',
      background: '#FFFBEB',
      sidebar: '#B45309',
      card: '#FFFFFF',
      text: '#78350F',
      textSecondary: '#A16207',
      border: '#FDE68A',
      highlight: '#FEF3C7',
    },
    dark: {
      primary: '#FBBF24',
      secondary: '#FCD34D',
      accent: '#FDE68A',
      background: '#1A1206',
      sidebar: '#78350F',
      card: '#92400E',
      text: '#FFFBEB',
      textSecondary: '#FDE68A',
      border: '#A16207',
      highlight: '#92400E',
    },
    fontFamily: '"Righteous", cursive',
    iconStyle: 'playful',
  },
  {
    id: 'el-condor-pasa',
    name: 'El Condor Pasa',
    character: 'エルコンドルパサー',
    description: 'The Masked Condor',
    light: {
      primary: '#006400',
      secondary: '#003200',
      accent: '#0B3D02',
      background: '#F0FDF4',
      sidebar: '#14532D',
      card: '#FFFFFF',
      text: '#052E16',
      textSecondary: '#166534',
      border: '#BBF7D0',
      highlight: '#DCFCE7',
    },
    dark: {
      primary: '#4ADE80',
      secondary: '#86EFAC',
      accent: '#BBF7D0',
      background: '#021A0D',
      sidebar: '#052E16',
      card: '#14532D',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#166534',
      highlight: '#14532D',
    },
    fontFamily: '"Lora", Georgia, serif',
    iconStyle: 'bold',
  },
  {
    id: 'manhattan-cafe',
    name: 'Manhattan Cafe',
    character: 'マンハッタンカフェ',
    description: 'The Quiet Eclipse',
    light: {
      primary: '#800000',
      secondary: '#000000',
      accent: '#4F0000',
      background: '#F5F5F4',
      sidebar: '#292524',
      card: '#FFFFFF',
      text: '#1C1917',
      textSecondary: '#44403C',
      border: '#D6D3D1',
      highlight: '#E7E5E4',
    },
    dark: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5',
      background: '#0C0A09',
      sidebar: '#1C1917',
      card: '#292524',
      text: '#FAFAF9',
      textSecondary: '#D6D3D1',
      border: '#44403C',
      highlight: '#292524',
    },
    fontFamily: '"EB Garamond", Georgia, serif',
    iconStyle: 'elegant',
  },
  {
    id: 'super-creek',
    name: 'Super Creek',
    character: 'スーパークリーク',
    description: 'The Healing Big Sister',
    light: {
      primary: '#0000CD',
      secondary: '#00009C',
      accent: '#00009C',
      background: '#EFF6FF',
      sidebar: '#1E3A8A',
      card: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#2563EB',
      border: '#BFDBFE',
      highlight: '#DBEAFE',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#93C5FD',
      accent: '#BFDBFE',
      background: '#0C1929',
      sidebar: '#1E3A8A',
      card: '#1E40AF',
      text: '#EFF6FF',
      textSecondary: '#BFDBFE',
      border: '#2563EB',
      highlight: '#1D4ED8',
    },
    fontFamily: '"Quicksand", sans-serif',
    iconStyle: 'soft',
  },
  {
    id: 'ikuno-dictus',
    name: 'Ikuno Dictus',
    character: 'イクノディクタス',
    description: 'The Dutiful Iron Lady',
    light: {
      primary: '#FFC0CB',
      secondary: '#FF99B3',
      accent: '#FFC0CB',
      background: '#FDF2F8',
      sidebar: '#BE185D',
      card: '#FFFFFF',
      text: '#831843',
      textSecondary: '#9D174D',
      border: '#FBCFE8',
      highlight: '#FCE7F3',
    },
    dark: {
      primary: '#F9A8D4',
      secondary: '#FBCFE8',
      accent: '#FECDD3',
      background: '#1A0812',
      sidebar: '#831843',
      card: '#9D174D',
      text: '#FDF2F8',
      textSecondary: '#FBCFE8',
      border: '#BE185D',
      highlight: '#9D174D',
    },
    fontFamily: '"Libre Baskerville", serif',
    iconStyle: 'elegant',
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
