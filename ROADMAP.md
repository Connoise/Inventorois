# Household Inventory App - Implementation Roadmap

## 🎯 Project Overview

**App Name:** HomeBase (or your preferred name)  
**Architecture:** Progressive Web App (PWA) + Supabase Backend  
**Target Platforms:** Windows (Browser), Android (Installable PWA)  
**Migration Path:** Supabase Cloud → Self-hosted Supabase → Custom PostgreSQL

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Working MVP with core inventory functionality

#### 1.1 Project Setup
- [ ] Create Supabase account and project
- [ ] Run database schema SQL
- [ ] Set up React project with Vite
- [ ] Configure Tailwind CSS
- [ ] Set up Supabase client
- [ ] Configure authentication (email/password + Google)

#### 1.2 Core Data Management
- [ ] Items CRUD (Create, Read, Update, Delete)
- [ ] Categories display and selection
- [ ] Basic search functionality
- [ ] Quantity tracking with +/- buttons

#### 1.3 Location System
- [ ] Location tree viewer
- [ ] Add/Edit/Delete locations
- [ ] Nested hierarchy navigation
- [ ] Assign items to locations

#### 1.4 Essential UI
- [ ] Responsive layout (mobile-first)
- [ ] Dark mode toggle
- [ ] Basic navigation
- [ ] Loading states

### Phase 2: Enhanced Features (Week 3-4)
**Goal:** Full feature set for daily use

#### 2.1 Advanced Item Features
- [ ] Tags system (create, assign, filter)
- [ ] Favorites/pinned items
- [ ] Essential items flagging
- [ ] Threshold alerts (visual indicators)
- [ ] Price tracking

#### 2.2 Templates System
- [ ] Browse templates
- [ ] Create item from template
- [ ] Create custom templates
- [ ] Template usage tracking

#### 2.3 History & Undo
- [ ] Change history logging (automatic)
- [ ] Recently modified dashboard
- [ ] Undo last action
- [ ] Redo functionality
- [ ] Full history viewer

#### 2.4 Export & Reports
- [ ] CSV export (all items)
- [ ] Filtered export
- [ ] Low stock report
- [ ] Category summary

### Phase 3: Multi-User & Notifications (Week 5-6)
**Goal:** Family collaboration features

#### 3.1 User Management
- [ ] Invite family members
- [ ] User profiles
- [ ] Activity attribution (who changed what)
- [ ] Role-based permissions (optional)

#### 3.2 Push Notifications
- [ ] Service worker setup
- [ ] Push subscription management
- [ ] Low stock alerts
- [ ] Expiration reminders
- [ ] Item update notifications

#### 3.3 Real-time Sync
- [ ] Supabase real-time subscriptions
- [ ] Optimistic UI updates
- [ ] Conflict resolution
- [ ] Offline queue

### Phase 4: Advanced Features (Future)
**Goal:** Power user functionality

#### 4.1 Image Management
- [ ] Camera capture
- [ ] Image upload
- [ ] Image compression
- [ ] Gallery view
- [ ] Primary image selection

#### 4.2 Barcode Integration
- [ ] Camera barcode scanning
- [ ] Quick lookup by barcode
- [ ] Auto-fill from product databases

#### 4.3 Analytics
- [ ] Inventory value summary
- [ ] Category breakdown
- [ ] Consumption trends
- [ ] Cost tracking over time

#### 4.4 Self-Hosting Migration
- [ ] Docker Compose setup for Supabase
- [ ] Data migration scripts
- [ ] SSL/domain configuration
- [ ] Backup automation

---

## 🛠 Technical Stack

### Frontend
```
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- React Router (navigation)
- TanStack Query (data fetching & caching)
- Zustand (state management for undo/redo)
- Workbox (PWA service worker)
```

### Backend (Supabase)
```
- PostgreSQL database
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions (for notifications)
- Storage (when self-hosted)
```

### Development Tools
```
- ESLint + Prettier (code quality)
- Vitest (testing)
- GitHub Actions (CI/CD)
```

---

## 📁 Project Structure

```
/inventory-app
├── /database
│   ├── schema.sql          # Full database schema
│   ├── migrations/         # Version-controlled changes
│   └── seeds/              # Sample data for testing
│
├── /src
│   ├── /components
│   │   ├── /items          # Item-related components
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemList.tsx
│   │   │   ├── ItemDetail.tsx
│   │   │   └── QuickAdd.tsx
│   │   │
│   │   ├── /categories     # Category components
│   │   │   ├── CategoryTree.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   └── CategoryManager.tsx
│   │   │
│   │   ├── /locations      # Location components
│   │   │   ├── LocationTree.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── LocationForm.tsx
│   │   │   └── LocationBreadcrumb.tsx
│   │   │
│   │   ├── /tags           # Tag components
│   │   │   ├── TagInput.tsx
│   │   │   ├── TagList.tsx
│   │   │   └── TagManager.tsx
│   │   │
│   │   ├── /templates      # Template components
│   │   │   ├── TemplateList.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   └── TemplateForm.tsx
│   │   │
│   │   ├── /history        # History/undo components
│   │   │   ├── RecentChanges.tsx
│   │   │   ├── HistoryViewer.tsx
│   │   │   └── UndoToast.tsx
│   │   │
│   │   ├── /notifications  # Notification components
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── PushManager.tsx
│   │   │
│   │   └── /ui             # Shared UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── SearchBar.tsx
│   │       ├── FilterPanel.tsx
│   │       ├── ThemeToggle.tsx
│   │       └── QuantityControl.tsx
│   │
│   ├── /hooks              # Custom React hooks
│   │   ├── useItems.ts
│   │   ├── useCategories.ts
│   │   ├── useLocations.ts
│   │   ├── useTags.ts
│   │   ├── useHistory.ts
│   │   ├── useUndo.ts
│   │   ├── useSearch.ts
│   │   ├── useTheme.ts
│   │   └── useNotifications.ts
│   │
│   ├── /services           # API and external services
│   │   ├── supabase.ts     # Supabase client
│   │   ├── items.ts        # Item API functions
│   │   ├── categories.ts
│   │   ├── locations.ts
│   │   ├── tags.ts
│   │   ├── history.ts
│   │   ├── templates.ts
│   │   ├── notifications.ts
│   │   └── export.ts       # CSV export
│   │
│   ├── /stores             # State management
│   │   ├── undoStore.ts    # Undo/redo state
│   │   ├── uiStore.ts      # UI state (modals, toasts)
│   │   └── filterStore.ts  # Active filters
│   │
│   ├── /pages              # Page components
│   │   ├── Dashboard.tsx   # Home with recent & alerts
│   │   ├── Inventory.tsx   # Main item list
│   │   ├── ItemDetail.tsx  # Single item view
│   │   ├── Categories.tsx  # Category management
│   │   ├── Locations.tsx   # Location management
│   │   ├── Tags.tsx        # Tag management
│   │   ├── Templates.tsx   # Template browser
│   │   ├── History.tsx     # Full change history
│   │   ├── Settings.tsx    # User preferences
│   │   └── Export.tsx      # Export options
│   │
│   ├── /types              # TypeScript types
│   │   ├── item.ts
│   │   ├── category.ts
│   │   ├── location.ts
│   │   ├── tag.ts
│   │   ├── history.ts
│   │   └── supabase.ts     # Generated types
│   │
│   ├── /utils              # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── csvExport.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── /public
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # App icons
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Next Steps (In Order)

### Step 1: Create Supabase Project (Today)
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (choose region closest to you)
3. Wait for project to initialize (~2 minutes)
4. Go to SQL Editor
5. Copy and paste the schema.sql content
6. Run the SQL (creates all tables, functions, seed data)

### Step 2: Save Connection Details
From Supabase dashboard > Settings > API:
- Copy "Project URL" (e.g., `https://xxxxx.supabase.co`)
- Copy "anon public" key
- Save these securely

### Step 3: Set Up Authentication
1. Go to Authentication > Providers
2. Enable Email (default)
3. Optionally enable Google OAuth:
   - Create Google Cloud project
   - Set up OAuth consent screen
   - Create OAuth credentials
   - Add credentials to Supabase

### Step 4: Build MVP
I'll create a working prototype that you can:
- Test immediately in browser
- Iterate on with me
- Deploy when ready

### Step 5: Deploy PWA
Options for hosting the frontend:
1. **Vercel** (recommended) - Free, automatic deploys from GitHub
2. **Netlify** - Similar to Vercel
3. **GitHub Pages** - Free but manual setup
4. **Self-hosted** - When server is ready

---

## 💰 Cost Analysis

### Supabase Free Tier Limits
| Resource | Free Limit | Your Usage Estimate |
|----------|------------|---------------------|
| Database | 500 MB | ~50 MB (10,000 items) |
| Storage | 1 GB | 0 (images later) |
| Bandwidth | 2 GB/month | ~500 MB |
| Auth Users | Unlimited | 5-10 family members |
| API Requests | Unlimited | Well within limits |

**Verdict:** Free tier is more than sufficient for your household use.

### When Self-Hosting
| Resource | Cost |
|----------|------|
| Mini PC (one-time) | $150-300 |
| Electricity | ~$5-10/month |
| Domain (optional) | ~$12/year |
| Dynamic DNS | Free (DuckDNS) |

---

## 🔄 Self-Hosting Migration Guide (Future Reference)

### Prerequisites
- Always-on server (your future mini PC)
- Docker and Docker Compose installed
- Domain name (optional but recommended)

### Migration Steps

```bash
# 1. Export data from Supabase Cloud
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql

# 2. Clone Supabase self-hosted
git clone https://github.com/supabase/supabase
cd supabase/docker

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start services
docker-compose up -d

# 5. Import data
psql -h localhost -U postgres -d postgres < backup.sql

# 6. Update app configuration
# Change SUPABASE_URL in your app from:
#   https://xxxxx.supabase.co
# To:
#   https://your-domain.com (or http://your-local-ip:8000)
```

### Self-Hosted Supabase Requirements
- 4GB RAM minimum (8GB recommended)
- 20GB storage (more for images)
- Docker + Docker Compose
- Ports: 8000 (API), 3000 (Studio), 5432 (PostgreSQL)

---

## ❓ Questions for Next Session

1. **App Name:** What would you like to call the app?

2. **Initial Categories:** Should I include more predefined categories, or are the 12 seed categories sufficient?

3. **Unit Preferences:** What units do you commonly use? (I included: units, pcs, kg, lbs, liters, rolls, bottles, bags)

4. **Color Scheme:** Any preference for the primary color? (Currently using blue)

5. **Starting View:** When you open the app, what should you see first?
   - Dashboard (recent changes, alerts, favorites)
   - Full inventory list
   - Category view

---

## 📞 Ready to Start?

Once you've:
1. ✅ Created Supabase account
2. ✅ Run the schema SQL
3. ✅ Saved your connection details

Let me know and I'll:
1. Build the working MVP prototype
2. Walk you through testing it
3. Help you deploy it

Or if you want to see the prototype first to validate the UX, I can build that right now using mock data!
