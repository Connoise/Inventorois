import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as itemsService from '../services/items';
import * as categoriesService from '../services/categories';
import * as locationsService from '../services/locations';
import * as tagsService from '../services/tags';
import * as templatesService from '../services/templates';
import * as historyService from '../services/history';
import * as notificationsService from '../services/notifications';
import { useUndoStore, useFilterStore } from '../stores';
import type { 
  ItemWithRelations, 
  CategoryWithChildren, 
  LocationWithChildren,
  TagWithCount,
  ItemTemplate,
  ChangeHistory,
  Notification,
  Item
} from '../types/supabase';

// Generic fetch hook
function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// Items hook
export function useItems() {
  const { filters } = useFilterStore();
  const { pushUndo } = useUndoStore();
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await itemsService.fetchItems(filters);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchItems]);

  const updateQuantity = useCallback(async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const previousState = { ...item };
    const newQuantity = Math.max(0, item.quantity + delta);

    // Optimistic update
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        let newStatus: Item['status'] = 'in_stock';
        if (newQuantity === 0) newStatus = 'out_of_stock';
        else if (i.min_threshold && newQuantity <= i.min_threshold) newStatus = 'low_stock';
        return { ...i, quantity: newQuantity, status: newStatus };
      }
      return i;
    }));

    try {
      await itemsService.updateItemQuantity(id, newQuantity);
      
      // Push to undo stack
      const updatedItem = items.find(i => i.id === id);
      if (updatedItem) {
        pushUndo({
          type: 'quantity_update',
          itemId: id,
          previousState,
          newState: updatedItem,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      // Revert on error
      setItems(prev => prev.map(i => i.id === id ? previousState : i));
      throw err;
    }
  }, [items, pushUndo]);

  const toggleFavorite = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Optimistic update
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, is_favorite: !i.is_favorite } : i
    ));

    try {
      await itemsService.toggleItemFavorite(id);
    } catch (err) {
      // Revert on error
      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, is_favorite: item.is_favorite } : i
      ));
      throw err;
    }
  }, [items]);

  const createItem = useCallback(async (
    item: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'status'>,
    locationId?: string,
    tagIds?: string[]
  ) => {
    const newItem = await itemsService.createItem(item, locationId, tagIds);
    await fetchItems();
    return newItem;
  }, [fetchItems]);

  const updateItem = useCallback(async (
    id: string,
    updates: Partial<Item>,
    newLocationId?: string,
    newTagIds?: string[]
  ) => {
    const updatedItem = await itemsService.updateItem(id, updates, newLocationId, newTagIds);
    await fetchItems();
    return updatedItem;
  }, [fetchItems]);

  const archiveItem = useCallback(async (id: string) => {
    await itemsService.archiveItem(id);
    await fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    updateQuantity,
    toggleFavorite,
    createItem,
    updateItem,
    archiveItem,
  };
}

// Categories hook
export function useCategories() {
  const { data, loading, error, refetch } = useFetch(
    () => categoriesService.fetchCategoryTree()
  );

  const createCategory = useCallback(async (
    category: Parameters<typeof categoriesService.createCategory>[0]
  ) => {
    const newCategory = await categoriesService.createCategory(category);
    refetch();
    return newCategory;
  }, [refetch]);

  const updateCategory = useCallback(async (
    id: string,
    updates: Parameters<typeof categoriesService.updateCategory>[1]
  ) => {
    const updated = await categoriesService.updateCategory(id, updates);
    refetch();
    return updated;
  }, [refetch]);

  const deleteCategory = useCallback(async (id: string) => {
    await categoriesService.deleteCategory(id);
    refetch();
  }, [refetch]);

  return {
    categories: data || [],
    loading,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// Locations hook
export function useLocations() {
  const { data: tree, loading, error, refetch } = useFetch(
    () => locationsService.fetchLocationTree()
  );
  
  const [options, setOptions] = useState<{ id: string; name: string; path: string; depth: number }[]>([]);

  useEffect(() => {
    locationsService.fetchLocationOptions().then(setOptions);
  }, [tree]);

  const createLocation = useCallback(async (
    location: Parameters<typeof locationsService.createLocation>[0]
  ) => {
    const newLocation = await locationsService.createLocation(location);
    refetch();
    return newLocation;
  }, [refetch]);

  const updateLocation = useCallback(async (
    id: string,
    updates: Parameters<typeof locationsService.updateLocation>[1]
  ) => {
    const updated = await locationsService.updateLocation(id, updates);
    refetch();
    return updated;
  }, [refetch]);

  const deleteLocation = useCallback(async (id: string) => {
    await locationsService.deleteLocation(id);
    refetch();
  }, [refetch]);

  return {
    locations: tree || [],
    locationOptions: options,
    loading,
    error,
    refetch,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}

// Tags hook
export function useTags() {
  const { data, loading, error, refetch } = useFetch(
    () => tagsService.fetchTags()
  );

  const createTag = useCallback(async (
    tag: Parameters<typeof tagsService.createTag>[0]
  ) => {
    const newTag = await tagsService.createTag(tag);
    refetch();
    return newTag;
  }, [refetch]);

  const updateTag = useCallback(async (
    id: string,
    updates: Parameters<typeof tagsService.updateTag>[1]
  ) => {
    const updated = await tagsService.updateTag(id, updates);
    refetch();
    return updated;
  }, [refetch]);

  const deleteTag = useCallback(async (id: string) => {
    await tagsService.deleteTag(id);
    refetch();
  }, [refetch]);

  return {
    tags: data || [],
    loading,
    error,
    refetch,
    createTag,
    updateTag,
    deleteTag,
  };
}

// Templates hook
export function useTemplates() {
  const { data, loading, error, refetch } = useFetch(
    () => templatesService.fetchTemplates()
  );

  const createTemplate = useCallback(async (
    template: Parameters<typeof templatesService.createTemplate>[0]
  ) => {
    const newTemplate = await templatesService.createTemplate(template);
    refetch();
    return newTemplate;
  }, [refetch]);

  const useTemplate = useCallback(async (id: string) => {
    await templatesService.incrementTemplateUseCount(id);
    refetch();
  }, [refetch]);

  const deleteTemplate = useCallback(async (id: string) => {
    await templatesService.deleteTemplate(id);
    refetch();
  }, [refetch]);

  return {
    templates: data || [],
    loading,
    error,
    refetch,
    createTemplate,
    useTemplate,
    deleteTemplate,
  };
}

// History hook
export function useHistory(limit: number = 50) {
  const { data, loading, error, refetch } = useFetch(
    () => historyService.fetchHistory(limit),
    [limit]
  );

  const groupedHistory = data ? historyService.groupHistoryByTime(data) : {};

  const undoChange = useCallback(async (historyId: string) => {
    await historyService.undoChange(historyId);
    refetch();
  }, [refetch]);

  return {
    history: data || [],
    groupedHistory,
    loading,
    error,
    refetch,
    undoChange,
  };
}

// Notifications hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationsService.fetchNotifications(),
        notificationsService.fetchUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
