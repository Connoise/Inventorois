import { create } from 'zustand';
import type { ItemWithRelations, ItemFilters } from '../types/supabase';

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
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  darkMode: localStorage.getItem('darkMode') === 'true',
  viewMode: (localStorage.getItem('viewMode') as 'grid' | 'list') || 'grid',
  showFilters: false,
  showAddModal: false,
  showEditModal: false,
  editingItemId: null,

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
