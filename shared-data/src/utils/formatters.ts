// Utility functions for formatting data

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj, 'short');
  }
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}

/**
 * Format odds
 */
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/**
 * Format bet status with color class
 */
export function formatBetStatus(status: string): { text: string; className: string } {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return { text: 'Pending', className: 'text-yellow-600 bg-yellow-100' };
    case 'WON':
      return { text: 'Won', className: 'text-green-600 bg-green-100' };
    case 'LOST':
      return { text: 'Lost', className: 'text-red-600 bg-red-100' };
    case 'VOID':
      return { text: 'Void', className: 'text-gray-600 bg-gray-100' };
    case 'CANCELED':
      return { text: 'Canceled', className: 'text-gray-600 bg-gray-100' };
    default:
      return { text: status, className: 'text-gray-600 bg-gray-100' };
  }
}

/**
 * Format match status with color class
 */
export function formatMatchStatus(status: string): { text: string; className: string } {
  switch (status.toUpperCase()) {
    case 'LIVE':
      return { text: 'Live', className: 'text-red-600 bg-red-100' };
    case 'UPCOMING':
      return { text: 'Upcoming', className: 'text-yellow-600 bg-yellow-100' };
    case 'COMPLETED':
      return { text: 'Completed', className: 'text-green-600 bg-green-100' };
    case 'CANCELLED':
      return { text: 'Cancelled', className: 'text-gray-600 bg-gray-100' };
    case 'POSTPONED':
      return { text: 'Postponed', className: 'text-blue-600 bg-blue-100' };
    default:
      return { text: status, className: 'text-gray-600 bg-gray-100' };
  }
}

/**
 * Format user status with color class
 */
export function formatUserStatus(status: string): { text: string; className: string } {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return { text: 'Active', className: 'text-green-600 bg-green-100' };
    case 'SUSPENDED':
      return { text: 'Suspended', className: 'text-red-600 bg-red-100' };
    case 'BANNED':
      return { text: 'Banned', className: 'text-red-600 bg-red-100' };
    case 'PENDING':
      return { text: 'Pending', className: 'text-yellow-600 bg-yellow-100' };
    default:
      return { text: status, className: 'text-gray-600 bg-gray-100' };
  }
}

/**
 * Format user role
 */
export function formatUserRole(role: string): string {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'Admin';
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'USER':
      return 'User';
    case 'AGENT':
      return 'Agent';
    case 'SUPER_AGENT':
      return 'Super Agent';
    default:
      return role;
  }
}

/**
 * Format risk level with color class
 */
export function formatRiskLevel(level: string): { text: string; className: string } {
  switch (level.toUpperCase()) {
    case 'LOW':
      return { text: 'Low', className: 'text-green-600 bg-green-100' };
    case 'MEDIUM':
      return { text: 'Medium', className: 'text-yellow-600 bg-yellow-100' };
    case 'HIGH':
      return { text: 'High', className: 'text-red-600 bg-red-100' };
    default:
      return { text: level, className: 'text-gray-600 bg-gray-100' };
  }
}

/**
 * Format game status with color class
 */
export function formatGameStatus(status: string): { text: string; className: string } {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return { text: 'Active', className: 'text-green-600 bg-green-100' };
    case 'MAINTENANCE':
      return { text: 'Maintenance', className: 'text-yellow-600 bg-yellow-100' };
    case 'INACTIVE':
      return { text: 'Inactive', className: 'text-gray-600 bg-gray-100' };
    default:
      return { text: status, className: 'text-gray-600 bg-gray-100' };
  }
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
