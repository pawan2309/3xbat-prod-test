// Domain access utilities - moved from frontend to backend for unified access
import { Role } from './roleHierarchy';

// Domain configuration
export const DOMAIN_CONFIG = {
  OWNER: 'control.3xbat.com',
  SUB_OWN: 'suo.3xbat.com',
  SUP_ADM: 'sup.3xbat.com',
  ADMIN: 'adm.3xbat.com',
  SUB_ADM: 'sub.3xbat.com',
  MAS_AGENT: 'mas.3xbat.com',
  SUP_AGENT: 'sua.3xbat.com',
  AGENT: 'age.3xbat.com',
  USER: '3xbat.com' // Separate package
} as const;

// Access control rules - each role has their own domain
export const DOMAIN_ACCESS_RULES: Record<Role, readonly string[]> = {
  OWNER: [DOMAIN_CONFIG.OWNER], // OWNER can only access operating panel
  SUB_OWN: [DOMAIN_CONFIG.SUB_OWN],
  SUP_ADM: [DOMAIN_CONFIG.SUP_ADM],
  ADMIN: [DOMAIN_CONFIG.ADMIN],
  SUB_ADM: [DOMAIN_CONFIG.SUB_ADM],
  MAS_AGENT: [DOMAIN_CONFIG.MAS_AGENT],
  SUP_AGENT: [DOMAIN_CONFIG.SUP_AGENT],
  AGENT: [DOMAIN_CONFIG.AGENT],
  USER: [DOMAIN_CONFIG.USER] // Separate package domain
} as const;

/**
 * Check if a user can access a specific domain
 */
export function canAccessDomain(userRole: Role, domain: string): boolean {
  const allowedDomains = DOMAIN_ACCESS_RULES[userRole];
  return allowedDomains.includes(domain);
}

/**
 * Get the primary domain for a user role
 */
export function getPrimaryDomain(userRole: Role): string {
  return DOMAIN_ACCESS_RULES[userRole][0];
}

/**
 * Check if user should be redirected based on their role and current domain
 */
export function shouldRedirect(userRole: Role, currentDomain: string): { shouldRedirect: boolean; targetDomain: string } {
  const primaryDomain = getPrimaryDomain(userRole);
  
  if (currentDomain !== primaryDomain) {
    return {
      shouldRedirect: true,
      targetDomain: primaryDomain
    };
  }
  
  return {
    shouldRedirect: false,
    targetDomain: currentDomain
  };
}

/**
 * Validate domain access for API requests
 */
export function validateDomainAccess(userRole: Role, requestDomain: string): boolean {
  return canAccessDomain(userRole, requestDomain);
}

/**
 * Get all accessible domains for a role
 */
export function getAccessibleDomains(userRole: Role): readonly string[] {
  return DOMAIN_ACCESS_RULES[userRole];
}

/**
 * Check if role is for user management (not USER role)
 */
export function isUserManagementRole(role: Role): boolean {
  return role !== 'USER' && role !== 'OWNER';
}

/**
 * Check if role is for operating panel only
 */
export function isOperatingPanelRole(role: Role): boolean {
  return role === 'OWNER';
}

/**
 * Check if role is for separate user package
 */
export function isUserPackageRole(role: Role): boolean {
  return role === 'USER';
}
