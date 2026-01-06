# Inventorois Changelog

## Version 2.0.0 - Major Update

### App Rebranding
- Renamed from "HomeBase" to "**Inventorois**"
- Dynamic app icon that can be customized in Settings

### New Features

#### Analysis Tab (Enhanced)
- **Cards/Charts Toggle**: Switch between card view and chart visualizations
- **Bar Charts**: Visual representations of stock status, categories, and values
- **Clickable Items**: Click any item in analysis lists to view full details
- **Show All Buttons**: Expand any section to see all items (not just top 5)
- **Item Detail Modal**: View complete item info including purchase date, notes, location
- **Responsive Text**: Text sizes adapt to panel width for better mobile experience

#### Wishlist Tab
- Add items you want to acquire
- Set priority (High/Medium/Low)
- Add links/URLs for products
- Add notes for specifications
- **Mark as Purchased**: Automatically opens Add Item form with:
  - Pre-filled item name
  - Pre-filled notes
  - Today's date as purchase date
- Delete wishlist items

#### Item Management Enhancements
- **Purchase Date (Acquired Date)**: Track when items were purchased
- **Expiration Date**: Track expiration for perishable items
- **Notes Field**: Add detailed notes to any item
- **Needs Replacement Flag**: Mark items ready to be replaced
  - Orange border on item cards
  - "Replace" badge indicator

#### Photo Upload
- **Camera Button**: Take new photo directly
- **Gallery Button**: Select existing photos from device

#### Settings Enhancements
- **Household Members**: View all users who have created accounts
- **Profile Pictures**: Upload avatar photos for user profiles
- **Custom App Icon**: Choose from 100+ emoji icons for the app

### Bug Fixes

#### Search Bar Bug (FIXED)
- **Issue**: Could only type one letter at a time in inventory search
- **Cause**: Inventory component was recreated on every state change, losing input focus
- **Fix**: Converted to stable JSX element instead of inline component

### Database Changes
New columns added to `items` table:
- `notes` (TEXT)
- `expiration_date` (DATE)
- `needs_replacement` (BOOLEAN)

New tables:
- `profiles` - User information and avatars
- `wishlist` - Wishlist items

---

## Recommended Future Features

### High Priority

1. **Barcode/QR Scanner**
   - Scan product barcodes to auto-fill item details
   - Generate QR codes for locations
   - Use device camera for scanning

2. **Shopping List Generation**
   - Auto-generate shopping list from low/out of stock items
   - Export to reminders or notes apps
   - Share with other household members

3. **Multi-Household Support**
   - Create multiple inventories (home, office, cabin)
   - Switch between households
   - Invite members to specific households

4. **Push Notifications**
   - Alert when items reach low stock threshold
   - Reminder for expiring items
   - Weekly inventory summary

### Medium Priority

5. **Recurring Items**
   - Set items as recurring (weekly, monthly)
   - Auto-add to shopping list when low
   - Track consumption patterns

6. **Receipt Scanning**
   - Upload receipt photos
   - Auto-extract items and prices
   - Link receipts to items for warranty purposes

7. **Bulk Operations**
   - Select multiple items
   - Bulk move, delete, or edit
   - Import from CSV/spreadsheet

8. **Item History**
   - Price history over time
   - Quantity change history
   - Purchase frequency analytics

9. **Advanced Search**
   - Search by notes content
   - Search by date ranges
   - Save search filters as presets

10. **Offline Mode**
    - Work without internet connection
    - Sync when connection restored
    - Local-first architecture

### Lower Priority

11. **Voice Commands**
    - "Add 2 rolls of paper towels"
    - "How many batteries do we have?"
    - Integration with voice assistants

12. **Widget Support**
    - Quick view widget for low stock items
    - Quick add button
    - Statistics at a glance

13. **Integrations**
    - Amazon/Walmart quick reorder links
    - Apple/Google Reminders sync
    - Smart home integration (smart pantry)

14. **Reports & Exports**
    - Monthly spending reports
    - Category breakdown PDFs
    - Tax/insurance documentation export

15. **Item Warranties**
    - Store warranty information
    - Warranty expiration alerts
    - Link warranty documents/receipts

16. **Family Member Assignment**
    - Assign items to specific family members
    - Personal item tracking
    - Kids' belongings management

### Technical Improvements

17. **Performance Optimization**
    - Virtual scrolling for large inventories
    - Image lazy loading
    - Reduce bundle size

18. **Accessibility**
    - Screen reader support
    - Keyboard navigation
    - High contrast mode

19. **Progressive Web App Enhancements**
    - Better offline support
    - Background sync
    - Install prompts

20. **Data Security**
    - End-to-end encryption option
    - Two-factor authentication
    - Data export/backup automation

---

## Known Limitations

1. **Browser Storage**: LocalStorage used for app icon preference (clears on cache clear)
2. **Image Size**: Large images may take longer to upload on slow connections
3. **Real-time Sync**: Changes by other users require page refresh to see
4. **Mobile Safari**: Some date picker styling may vary

---

## Database Migration Required

Run the following SQL in Supabase to enable new features:

```sql
-- See database/add-wishlist-profiles.sql for complete migration
```
