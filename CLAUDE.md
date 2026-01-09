# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# TypeScript type checking
npm run typecheck

# Preview production build
npm run preview
```

## Architecture Overview

HomeBase is a household inventory management PWA built with React, TypeScript, and Supabase.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (stores/index.ts)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Icons**: Lucide React

### Core Data Flow

```
Supabase DB  <-->  Services (src/services/)  <-->  Hooks (src/hooks/)  <-->  Components
                         ^                              ^
                         |                              |
                   Types (src/types/)            Stores (src/stores/)
```

### Key Layers

**Services (`src/services/`)**: Direct Supabase API calls. Each entity has its own service file:
- `items.ts` - CRUD for inventory items, includes change logging
- `categories.ts` - Nested category tree operations
- `locations.ts` - Hierarchical location management (building > room > shelf)
- `tags.ts`, `templates.ts`, `history.ts`, `notifications.ts`

**Hooks (`src/hooks/index.ts`)**: React hooks that wrap services with state management:
- Generic `useFetch<T>` pattern for data loading
- Real-time subscriptions via Supabase channels (e.g., `useItems` subscribes to item changes)
- Optimistic updates with rollback on error (see `updateQuantity`, `toggleFavorite`)

**Stores (`src/stores/index.ts`)**: Zustand stores for UI state:
- `useUIStore` - Sidebar, modals, dark mode, theme selection
- `useFilterStore` - Item filtering state
- `useUndoStore` - Undo/redo stack for item changes
- `useNotificationStore` - Notification panel state
- Includes Uma Musume character themes (extensive theming system)

**Types (`src/types/supabase.ts`)**: TypeScript interfaces matching database schema.

### Database Schema

The schema (`database/schema.sql`) uses:
- Row Level Security (RLS) - all authenticated users can read/write
- Automatic triggers for `updated_at`, item status updates, location path caching
- Junction tables for many-to-many: `item_locations`, `item_tags`
- `change_history` table tracks all modifications for undo capability

Key tables: `items`, `categories`, `locations`, `tags`, `item_templates`, `notifications`

### Environment Setup

Copy `.env.example` to `.env` and add Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Working Preferences

1. Think through the problem and read relevant files before making changes
2. Check in before making major changes
3. Keep explanations high-level
4. Prefer simple, minimal changes over complex ones
5. Keep this documentation updated with architectural changes
6. Never speculate about code - always read files first
