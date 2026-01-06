// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString();
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// CSV Export
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        let cell = row[header];
        if (cell === null || cell === undefined) cell = '';
        if (typeof cell === 'object') cell = JSON.stringify(cell);
        // Escape quotes and wrap in quotes if contains comma
        cell = String(cell).replace(/"/g, '""');
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Classify status color
export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'in_stock':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'low_stock':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'out_of_stock':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    case 'on_order':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'discontinued':
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

// Get status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    on_order: 'On Order',
    discontinued: 'Discontinued',
  };
  return labels[status] || status;
}

// Validate required fields
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

// Parse tags from comma-separated string
export function parseTags(input: string): string[] {
  return input
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);
}

// Flatten nested tree structure
export function flattenTree<T extends { children?: T[] }>(
  items: T[],
  getLabel: (item: T, depth: number) => string,
  depth: number = 0
): { item: T; label: string; depth: number }[] {
  const result: { item: T; label: string; depth: number }[] = [];

  items.forEach(item => {
    result.push({ item, label: getLabel(item, depth), depth });
    if (item.children && item.children.length > 0) {
      result.push(...flattenTree(item.children, getLabel, depth + 1));
    }
  });

  return result;
}
