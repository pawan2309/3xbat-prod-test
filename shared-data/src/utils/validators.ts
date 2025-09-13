// Utility functions for data validation

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username
 */
export function isValidUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  if (!/^[a-zA-Z]/.test(username)) {
    errors.push('Username must start with a letter');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate bet amount
 */
export function isValidBetAmount(amount: number, minBet: number = 1, maxBet: number = 10000): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (amount < minBet) {
    errors.push(`Minimum bet amount is ${minBet}`);
  }
  
  if (amount > maxBet) {
    errors.push(`Maximum bet amount is ${maxBet}`);
  }
  
  if (!Number.isFinite(amount)) {
    errors.push('Bet amount must be a valid number');
  }
  
  if (amount <= 0) {
    errors.push('Bet amount must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate odds
 */
export function isValidOdds(odds: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (odds < 1.01) {
    errors.push('Odds must be at least 1.01');
  }
  
  if (odds > 1000) {
    errors.push('Odds must be no more than 1000');
  }
  
  if (!Number.isFinite(odds)) {
    errors.push('Odds must be a valid number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate date
 */
export function isValidDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Validate future date
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Validate past date
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

/**
 * Validate integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Validate percentage
 */
export function isValidPercentage(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Validate color hex code
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Validate JSON string
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate string length
 */
export function isValidStringLength(
  str: string, 
  minLength: number, 
  maxLength: number
): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

/**
 * Validate alphanumeric string
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate alphabetic string
 */
export function isAlphabetic(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Validate numeric string
 */
export function isNumeric(str: string): boolean {
  return /^[0-9]+$/.test(str);
}
