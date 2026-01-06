import React, { useState, useEffect } from 'react';
import { 
  Home, Package, FolderTree, MapPin, Tags, FileText, History, Settings,
  Plus, Search, Filter, Grid, List, Moon, Sun, Bell, Menu, X, ChevronRight,
  ChevronDown, Star, StarOff, AlertTriangle, Edit2, Trash2, Save, RotateCcw,
  Download, Upload, MoreVertical, Check, Clock, TrendingDown, Archive,
  Undo2, Redo2
} from 'lucide-react';

// Mock data
const mockCategories = [
  { id: '1', name: 'Kitchen & Pantry', icon: '🍳', color: '#F59E0B', count: 24, children: [
    { id: '1a', name: 'Food & Groceries', count: 15 },
    { id: '1b', name: 'Cookware', count: 9 }
  ]},
  { id: '2', name: 'Bathroom', icon: '🛁', color: '#3B82F6', count: 12 },
  { id: '3', name: 'Cleaning Supplies', icon: '✨', color: '#10B981', count: 8 },
  { id: '4', name: 'Electronics', icon: '💻', color: '#6366F1', count: 15 },
  { id: '5', name: 'Office & Stationery', icon: '📝', color: '#8B5CF6', count: 6 },
  { id: '6', name: 'Health & Medicine', icon: '💊', color: '#EF4444', count: 10 },
];

const mockLocations = [
  { id: '1', name: 'House', type: 'building', children: [
    { id: '1a', name: 'Kitchen', type: 'room', children: [
      { id: '1a1', name: 'Pantry', type: 'area', children: [
        { id: '1a1a', name: 'Top Shelf', type: 'shelf' },
        { id: '1a1b', name: 'Middle Shelf', type: 'shelf' },
        { id: '1a1c', name: 'Bottom Shelf', type: 'shelf' },
      ]},
      { id: '1a2', name: 'Under Sink Cabinet', type: 'furniture' },
    ]},
    { id: '1b', name: 'Bathroom', type: 'room', children: [
      { id: '1b1', name: 'Medicine Cabinet', type: 'furniture' },
      { id: '1b2', name: 'Under Sink', type: 'furniture' },
    ]},
    { id: '1c', name: 'Garage', type: 'room' },
  ]}
];

const mockItems = [
  { id: '1', name: 'Paper Towels', category: 'Cleaning Supplies', quantity: 3, unit: 'rolls', minThreshold: 4, isEssential: true, isFavorite: true, status: 'low_stock', location: 'Kitchen > Pantry > Top Shelf', price: 12.99, updatedAt: '2 hours ago', tags: ['consumable'] },
  { id: '2', name: 'Toilet Paper', category: 'Bathroom', quantity: 12, unit: 'rolls', minThreshold: 8, isEssential: true, isFavorite: true, status: 'in_stock', location: 'Bathroom > Under Sink', price: 24.99, updatedAt: '1 day ago', tags: ['consumable'] },
  { id: '3', name: 'AA Batteries', category: 'Electronics', quantity: 4, unit: 'pcs', minThreshold: 8, isEssential: true, isFavorite: false, status: 'low_stock', location: 'Kitchen > Under Sink Cabinet', price: 8.99, updatedAt: '3 days ago', tags: ['electronics', 'consumable'] },
  { id: '4', name: 'Dish Soap', category: 'Cleaning Supplies', quantity: 2, unit: 'bottles', minThreshold: 1, isEssential: true, isFavorite: false, status: 'in_stock', location: 'Kitchen > Under Sink Cabinet', price: 4.99, updatedAt: '1 week ago', tags: ['cleaning', 'consumable'] },
  { id: '5', name: 'Ibuprofen', category: 'Health & Medicine', quantity: 50, unit: 'tablets', minThreshold: 20, isEssential: true, isFavorite: false, status: 'in_stock', location: 'Bathroom > Medicine Cabinet', price: 9.99, updatedAt: '2 weeks ago', tags: ['medicine'] },
  { id: '6', name: 'Spare Phone Charger', category: 'Electronics', quantity: 2, unit: 'pcs', minThreshold: null, isEssential: false, isFavorite: true, status: 'in_stock', location: 'Office', price: 15.99, updatedAt: '1 month ago', tags: ['electronics'] },
  { id: '7', name: 'Hand Soap', category: 'Bathroom', quantity: 0, unit: 'bottles', minThreshold: 2, isEssential: true, isFavorite: false, status: 'out_of_stock', location: 'Bathroom > Under Sink', price: 3.99, updatedAt: '5 hours ago', tags: ['consumable', 'bathroom'] },
  { id: '8', name: 'Laundry Detergent', category: 'Cleaning Supplies', quantity: 1, unit: 'bottles', minThreshold: 1, isEssential: true, isFavorite: false, status: 'low_stock', location: 'Garage', price: 14.99, updatedAt: '3 hours ago', tags: ['cleaning', 'consumable'] },
];

const mockRecentChanges = [
  { id: '1', item: 'Hand Soap', action: 'updated', field: 'quantity', oldValue: '1', newValue: '0', user: 'You', time: '5 hours ago' },
  { id: '2', item: 'Paper Towels', action: 'updated', field: 'quantity', oldValue: '5', newValue: '3', user: 'You', time: '2 hours ago' },
  { id: '3', item: 'Laundry Detergent', action: 'created', user: 'Family Member', time: '3 hours ago' },
  { id: '4', item: 'First Aid Kit', action: 'updated', field: 'location', oldValue: 'Kitchen', newValue: 'Bathroom', user: 'You', time: '1 day ago' },
];

const mockTemplates = [
  { id: '1', name: 'Paper Towels', category: 'Cleaning', isEssential: true, minThreshold: 4, unit: 'rolls' },
  { id: '2', name: 'Toilet Paper', category: 'Bathroom', isEssential: true, minThreshold: 8, unit: 'rolls' },
  { id: '3', name: 'Dish Soap', category: 'Cleaning', isEssential: true, minThreshold: 1, unit: 'bottles' },
  { id: '4', name: 'AA Batteries', category: 'Electronics', isEssential: true, minThreshold: 8, unit: 'pcs' },
  { id: '5', name: 'Hand Soap', category: 'Bathroom', isEssential: true, minThreshold: 2, unit: 'bottles' },
];

const mockTags = [
  { id: '1', name: 'consumable', color: '#10B981', count: 15 },
  { id: '2', name: 'electronics', color: '#6366F1', count: 8 },
  { id: '3', name: 'cleaning', color: '#F59E0B', count: 6 },
  { id: '4', name: 'medicine', color: '#EF4444', count: 4 },
  { id: '5', name: 'bathroom', color: '#3B82F6', count: 5 },
  { id: '6', name: 'emergency', color: '#DC2626', count: 2 },
];

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [items, setItems] = useState(mockItems);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Low Stock Alert', body: 'Paper Towels is running low', unread: true },
    { id: '2', title: 'Out of Stock', body: 'Hand Soap needs to be restocked', unread: true },
    { id: '3', title: 'Low Stock Alert', body: 'AA Batteries below threshold', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState(['1', '1a', '1b']);

  const bgMain = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

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

  const toggleFavorite = (itemId) => {
    const item = items.find(i => i.id === itemId);
    const oldState = [...items];
    
    setItems(items.map(i => 
      i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i
    ));
    
    setUndoStack([...undoStack, { action: 'toggle_favorite', itemId, oldState }]);
    setRedoStack([]);
  };

  const updateQuantity = (itemId, delta) => {
    const oldState = [...items];
    
    setItems(items.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        let newStatus = 'in_stock';
        if (newQty === 0) newStatus = 'out_of_stock';
        else if (i.minThreshold && newQty <= i.minThreshold) newStatus = 'low_stock';
        return { ...i, quantity: newQty, status: newStatus, updatedAt: 'Just now' };
      }
      return i;
    }));
    
    setUndoStack([...undoStack, { action: 'update_quantity', itemId, delta, oldState }]);
    setRedoStack([]);
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 5000);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, { ...lastAction, currentState: [...items] }]);
    setItems(lastAction.oldState);
    setUndoStack(undoStack.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lastRedo = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, { ...lastRedo, oldState: [...items] }]);
    setItems(lastRedo.currentState);
    setRedoStack(redoStack.slice(0, -1));
  };

  const getStatusBadge = (status) => {
    const styles = {
      in_stock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      low_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    const labels = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const LocationTree = ({ locations, level = 0 }) => {
    return (
      <div className={level > 0 ? 'ml-4' : ''}>
        {locations.map(loc => (
          <div key={loc.id}>
            <div 
              className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              onClick={() => {
                if (loc.children) {
                  setExpandedLocations(prev => 
                    prev.includes(loc.id) 
                      ? prev.filter(id => id !== loc.id)
                      : [...prev, loc.id]
                  );
                }
              }}
            >
              {loc.children ? (
                expandedLocations.includes(loc.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : <div className="w-4" />}
              <MapPin size={16} className={textSecondary} />
              <span className={textPrimary}>{loc.name}</span>
              <span className={`text-xs ${textSecondary}`}>({loc.type})</span>
            </div>
            {loc.children && expandedLocations.includes(loc.id) && (
              <LocationTree locations={loc.children} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} ${bgCard} h-full flex flex-col border-r ${borderColor}`}>
      <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-white" />
          </div>
          <span className={`font-bold text-lg ${textPrimary}`}>HomeBase</span>
        </div>
        {mobile && (
          <button onClick={() => setMobileSidebarOpen(false)}>
            <X size={24} className={textPrimary} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentPage(item.id);
              if (mobile) setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-blue-500 text-white'
                : `${textSecondary} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${borderColor}`}>
        <div className={`text-xs ${textSecondary} mb-2`}>Quick Stats</div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded`}>
            <div className={`text-lg font-bold ${textPrimary}`}>{items.length}</div>
            <div className={`text-xs ${textSecondary}`}>Total Items</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded`}>
            <div className="text-lg font-bold text-yellow-500">{items.filter(i => i.status === 'low_stock').length}</div>
            <div className={`text-xs ${textSecondary}`}>Low Stock</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ItemCard = ({ item }) => (
    <div className={`${bgCard} rounded-lg border ${borderColor} p-4 hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${textPrimary}`}>{item.name}</h3>
            {item.isEssential && (
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
                Essential
              </span>
            )}
          </div>
          <p className={`text-sm ${textSecondary}`}>{item.category}</p>
        </div>
        <button onClick={() => toggleFavorite(item.id)} className="p-1">
          {item.isFavorite ? (
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
          ) : (
            <StarOff size={20} className={textSecondary} />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => updateQuantity(item.id, -1)}
            className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center`}
          >
            -
          </button>
          <span className={`font-bold text-xl ${textPrimary} min-w-[60px] text-center`}>
            {item.quantity} <span className="text-sm font-normal">{item.unit}</span>
          </span>
          <button 
            onClick={() => updateQuantity(item.id, 1)}
            className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center`}
          >
            +
          </button>
        </div>
        {getStatusBadge(item.status)}
      </div>

      {item.minThreshold && item.status !== 'in_stock' && (
        <div className="flex items-center gap-1 text-yellow-600 text-sm mb-2">
          <AlertTriangle size={14} />
          <span>Below threshold ({item.minThreshold})</span>
        </div>
      )}

      <div className={`text-xs ${textSecondary} space-y-1`}>
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Updated {item.updatedAt}</span>
        </div>
        {item.price && (
          <div className="font-medium">${item.price.toFixed(2)}</div>
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.map(tag => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t ${borderColor}">
        <button 
          onClick={() => { setSelectedItem(item); setShowItemModal(true); }}
          className="flex-1 text-sm text-blue-500 hover:text-blue-600"
        >
          View Details
        </button>
        <button className="text-sm text-gray-500 hover:text-gray-600">
          <Edit2 size={14} />
        </button>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Alerts Section */}
      {items.filter(i => i.status === 'out_of_stock' || (i.isEssential && i.status === 'low_stock')).length > 0 && (
        <div className={`${darkMode ? 'bg-red-900/30' : 'bg-red-50'} border border-red-200 dark:border-red-800 rounded-lg p-4`}>
          <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={20} />
            Attention Needed
          </h3>
          <div className="space-y-2">
            {items.filter(i => i.status === 'out_of_stock').map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <span className={textPrimary}>{item.name}</span>
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
              </div>
            ))}
            {items.filter(i => i.isEssential && i.status === 'low_stock').map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <span className={textPrimary}>{item.name}</span>
                <span className="text-yellow-500 text-sm font-medium">Low Stock ({item.quantity} {item.unit})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <div className={`text-2xl font-bold ${textPrimary}`}>{items.length}</div>
          <div className={textSecondary}>Total Items</div>
        </div>
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <div className="text-2xl font-bold text-green-500">{items.filter(i => i.status === 'in_stock').length}</div>
          <div className={textSecondary}>In Stock</div>
        </div>
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <div className="text-2xl font-bold text-yellow-500">{items.filter(i => i.status === 'low_stock').length}</div>
          <div className={textSecondary}>Low Stock</div>
        </div>
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <div className="text-2xl font-bold text-red-500">{items.filter(i => i.status === 'out_of_stock').length}</div>
          <div className={textSecondary}>Out of Stock</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Changes */}
        <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
          <h3 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Clock size={18} />
            Recent Changes
          </h3>
          <div className="space-y-3">
            {mockRecentChanges.map(change => (
              <div key={change.id} className={`flex items-start gap-3 pb-3 border-b ${borderColor} last:border-0`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  change.action === 'created' ? 'bg-green-100 text-green-600' :
                  change.action === 'deleted' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {change.action === 'created' ? <Plus size={14} /> :
                   change.action === 'deleted' ? <Trash2 size={14} /> :
                   <Edit2 size={14} />}
                </div>
                <div className="flex-1">
                  <div className={textPrimary}>
                    <span className="font-medium">{change.item}</span>
                    {change.action === 'updated' && (
                      <span className={textSecondary}> {change.field}: {change.oldValue} → {change.newValue}</span>
                    )}
                    {change.action === 'created' && <span className={textSecondary}> was added</span>}
                  </div>
                  <div className={`text-xs ${textSecondary}`}>{change.user} • {change.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
          <h3 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Star size={18} className="text-yellow-500" />
            Favorites
          </h3>
          <div className="space-y-2">
            {items.filter(i => i.isFavorite).map(item => (
              <div key={item.id} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <div className={textPrimary}>{item.name}</div>
                  <div className={`text-xs ${textSecondary}`}>{item.location}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${textPrimary}`}>{item.quantity} {item.unit}</span>
                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Inventory = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className={`flex-1 flex items-center gap-2 ${bgCard} border ${borderColor} rounded-lg px-3 py-2`}>
            <Search size={18} className={textSecondary} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${textPrimary}`}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${borderColor} ${bgCard} ${showFilters ? 'bg-blue-50 border-blue-300' : ''}`}
          >
            <Filter size={18} className={showFilters ? 'text-blue-500' : textSecondary} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex rounded-lg border ${borderColor} overflow-hidden`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : bgCard}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : bgCard}`}
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={`text-sm ${textSecondary} block mb-1`}>Category</label>
              <select className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`}>
                <option>All Categories</option>
                {mockCategories.map(cat => (
                  <option key={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-sm ${textSecondary} block mb-1`}>Status</label>
              <select className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`}>
                <option>All Statuses</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
            <div>
              <label className={`text-sm ${textSecondary} block mb-1`}>Location</label>
              <select className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`}>
                <option>All Locations</option>
                <option>Kitchen</option>
                <option>Bathroom</option>
                <option>Garage</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className={`flex items-center gap-2 ${textPrimary}`}>
                <input type="checkbox" className="rounded" />
                <span>Essentials Only</span>
              </label>
              <label className={`flex items-center gap-2 ${textPrimary}`}>
                <input type="checkbox" className="rounded" />
                <span>Favorites</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-2'
      }>
        {items
          .filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(item => (
            viewMode === 'grid' ? (
              <ItemCard key={item.id} item={item} />
            ) : (
              <div key={item.id} className={`${bgCard} border ${borderColor} rounded-lg p-3 flex items-center gap-4`}>
                <button onClick={() => toggleFavorite(item.id)}>
                  {item.isFavorite ? (
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff size={18} className={textSecondary} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${textPrimary}`}>{item.name}</span>
                    {item.isEssential && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>
                    )}
                  </div>
                  <div className={`text-sm ${textSecondary}`}>{item.category} • {item.location}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-sm`}
                    >
                      -
                    </button>
                    <span className={`font-medium ${textPrimary} w-16 text-center`}>
                      {item.quantity} {item.unit}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className={`w-6 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-sm`}
                    >
                      +
                    </button>
                  </div>
                  {getStatusBadge(item.status)}
                  <button className={textSecondary}><MoreVertical size={18} /></button>
                </div>
              </div>
            )
          ))}
      </div>
    </div>
  );

  const Categories = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Categories</h2>
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
          <Plus size={18} />
          Add Category
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCategories.map(cat => (
          <div key={cat.id} className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h3 className={`font-semibold ${textPrimary}`}>{cat.name}</h3>
                <p className={`text-sm ${textSecondary}`}>{cat.count} items</p>
              </div>
            </div>
            {cat.children && (
              <div className={`space-y-1 pl-4 border-l-2 ${borderColor}`}>
                {cat.children.map(child => (
                  <div key={child.id} className={`text-sm ${textSecondary} flex justify-between`}>
                    <span>{child.name}</span>
                    <span>{child.count}</span>
                  </div>
                ))}
              </div>
            )}
            <div className={`mt-3 pt-3 border-t ${borderColor} flex gap-2`}>
              <button className="text-sm text-blue-500">Edit</button>
              <button className="text-sm text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Locations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Locations</h2>
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
          <Plus size={18} />
          Add Location
        </button>
      </div>
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        <p className={`text-sm ${textSecondary} mb-4`}>Click to expand/collapse. Locations support unlimited nesting levels.</p>
        <LocationTree locations={mockLocations} />
      </div>
    </div>
  );

  const TagsPage = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Tags</h2>
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
          <Plus size={18} />
          Add Tag
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {mockTags.map(tag => (
          <div key={tag.id} className={`${bgCard} border ${borderColor} rounded-lg p-3 flex items-center gap-3`}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className={textPrimary}>{tag.name}</span>
            <span className={`text-sm ${textSecondary}`}>({tag.count})</span>
            <button className="text-gray-400 hover:text-gray-600"><Edit2 size={14} /></button>
            <button className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const Templates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Item Templates</h2>
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
          <Plus size={18} />
          Create Template
        </button>
      </div>
      <p className={`${textSecondary}`}>Use templates to quickly add common items with pre-filled information.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTemplates.map(template => (
          <div key={template.id} className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-semibold ${textPrimary}`}>{template.name}</h3>
              {template.isEssential && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Essential</span>
              )}
            </div>
            <div className={`text-sm ${textSecondary} space-y-1`}>
              <div>Category: {template.category}</div>
              <div>Unit: {template.unit}</div>
              {template.minThreshold && <div>Min Threshold: {template.minThreshold}</div>}
            </div>
            <button className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
              <Plus size={16} />
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const HistoryPage = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${textPrimary}`}>Change History</h2>
        <button className="flex items-center gap-2 text-blue-500">
          <Download size={18} />
          Export History
        </button>
      </div>
      <div className={`${bgCard} border ${borderColor} rounded-lg divide-y ${borderColor}`}>
        {[...mockRecentChanges, ...mockRecentChanges].map((change, idx) => (
          <div key={idx} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              change.action === 'created' ? 'bg-green-100 text-green-600' :
              change.action === 'deleted' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {change.action === 'created' ? <Plus size={18} /> :
               change.action === 'deleted' ? <Trash2 size={18} /> :
               <Edit2 size={18} />}
            </div>
            <div className="flex-1">
              <div className={textPrimary}>
                <span className="font-medium">{change.item}</span>
                {change.action === 'updated' && (
                  <>
                    <span className={textSecondary}> - </span>
                    <span>{change.field} changed from </span>
                    <span className="font-medium">{change.oldValue}</span>
                    <span> to </span>
                    <span className="font-medium">{change.newValue}</span>
                  </>
                )}
                {change.action === 'created' && <span className={textSecondary}> was created</span>}
              </div>
              <div className={`text-sm ${textSecondary}`}>
                by {change.user} • {change.time}
              </div>
            </div>
            <button className="text-blue-500 text-sm hover:underline">
              <Undo2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className="space-y-6 max-w-2xl">
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Settings</h2>
      
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-4`}>
        <h3 className={`font-semibold ${textPrimary}`}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className={textPrimary}>Dark Mode</div>
            <div className={`text-sm ${textSecondary}`}>Use dark theme across the app</div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-4`}>
        <h3 className={`font-semibold ${textPrimary}`}>Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className={textPrimary}>Low stock alerts</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between">
            <span className={textPrimary}>Expiration reminders</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between">
            <span className={textPrimary}>Item updates by others</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
        </div>
      </div>

      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-4`}>
        <h3 className={`font-semibold ${textPrimary}`}>Data</h3>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border ${borderColor} rounded-lg">
            <Download size={18} />
            Export to CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border ${borderColor} rounded-lg">
            <Upload size={18} />
            Import Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'categories': return <Categories />;
      case 'locations': return <Locations />;
      case 'tags': return <TagsPage />;
      case 'templates': return <Templates />;
      case 'history': return <HistoryPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} flex`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`${bgCard} border-b ${borderColor} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={24} className={textPrimary} />
            </button>
            <h1 className={`text-xl font-semibold ${textPrimary} capitalize`}>
              {currentPage === 'dashboard' ? 'Dashboard' : currentPage}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className={`p-2 rounded ${undoStack.length === 0 ? 'opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Undo"
              >
                <Undo2 size={18} className={textSecondary} />
              </button>
              <button 
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className={`p-2 rounded ${redoStack.length === 0 ? 'opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Redo"
              >
                <Redo2 size={18} className={textSecondary} />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell size={20} className={textPrimary} />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-50`}>
                  <div className={`p-3 border-b ${borderColor} flex justify-between items-center`}>
                    <span className={`font-semibold ${textPrimary}`}>Notifications</span>
                    <button className="text-sm text-blue-500">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 border-b ${borderColor} ${notif.unread ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}>
                        <div className={`font-medium ${textPrimary}`}>{notif.title}</div>
                        <div className={`text-sm ${textSecondary}`}>{notif.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className={textPrimary} />}
            </button>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              U
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderPage()}
        </main>

        {/* Undo Toast */}
        {showUndoToast && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgCard} border ${borderColor} rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 z-50`}>
            <span className={textPrimary}>Item updated</span>
            <button 
              onClick={handleUndo}
              className="text-blue-500 font-medium hover:underline"
            >
              Undo
            </button>
            <button onClick={() => setShowUndoToast(false)}>
              <X size={16} className={textSecondary} />
            </button>
          </div>
        )}
      </div>

      {/* Add Item Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className={`relative ${bgCard} rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${borderColor} flex justify-between items-center`}>
              <h2 className={`text-xl font-semibold ${textPrimary}`}>Add New Item</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} className={textSecondary} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Item Name *</label>
                <input type="text" className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`} placeholder="Enter item name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Quantity *</label>
                  <input type="number" className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`} placeholder="0" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Unit</label>
                  <select className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`}>
                    <option>units</option>
                    <option>pcs</option>
                    <option>rolls</option>
                    <option>bottles</option>
                    <option>kg</option>
                    <option>lbs</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Category</label>
                <select className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`}>
                  <option>Select category</option>
                  {mockCategories.map(cat => (
                    <option key={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Location</label>
                <select className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`}>
                  <option>Select location</option>
                  <option>Kitchen &gt; Pantry &gt; Top Shelf</option>
                  <option>Kitchen &gt; Under Sink Cabinet</option>
                  <option>Bathroom &gt; Medicine Cabinet</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Min Threshold</label>
                  <input type="number" className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`} placeholder="Alert when below" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Price</label>
                  <input type="number" step="0.01" className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`} placeholder="$0.00" />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-1`}>Tags</label>
                <input type="text" className={`w-full p-2 rounded border ${borderColor} ${bgCard} ${textPrimary}`} placeholder="Add tags (comma separated)" />
              </div>
              <div className="flex items-center gap-4">
                <label className={`flex items-center gap-2 ${textPrimary}`}>
                  <input type="checkbox" className="rounded" />
                  <span>Essential Item</span>
                </label>
                <label className={`flex items-center gap-2 ${textPrimary}`}>
                  <input type="checkbox" className="rounded" />
                  <span>Favorite</span>
                </label>
              </div>
            </div>
            <div className={`p-4 border-t ${borderColor} flex justify-end gap-3`}>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg border ${borderColor}`}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
