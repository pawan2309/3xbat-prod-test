// Role hierarchy utilities - moved from frontend to backend for unified access
// Updated hierarchy order (highest to lowest authority)
const ROLE_HIERARCHY = {
  OWNER: 1,      // Level 1: Owner (highest authority)
  SUB_OWN: 2,    // Level 2: Sub-owner
  SUP_ADM: 3,    // Level 3: Super administrator
  ADMIN: 4,      // Level 4: Administrator
  SUB_ADM: 5,    // Level 5: Sub-administrator
  MAS_AGENT: 6,  // Level 6: Master agent
  SUP_AGENT: 7,  // Level 7: Super agent
  AGENT: 8,      // Level 8: Agent
  USER: 9        // Level 9: User (lowest level)
};

export type Role = keyof typeof ROLE_HIERARCHY;

// Function to get hierarchy index
export function getHierarchyIndex(role: string): number {
  console.log('🔵 getHierarchyIndex called with role:', role);
  const index = ROLE_HIERARCHY[role as Role];
  console.log('🔵 Role hierarchy index:', index);
  if (index === undefined) {
    console.warn(`🔴 Invalid role: ${role}`);
    return 0; // Return lowest priority for invalid roles
  }
  return index;
}

// Function to check if creation is direct subordinate or skip hierarchy
export function checkHierarchyRelationship(creatorRole: string, newUserRole: string): {
  isDirectSubordinate: boolean;
  upperRole: string | null;
  skipLevel: number;
} {
  const creatorIndex = getHierarchyIndex(creatorRole);
  const newUserIndex = getHierarchyIndex(newUserRole);
  
  if (creatorIndex === undefined || newUserIndex === undefined) {
    return { isDirectSubordinate: false, upperRole: null, skipLevel: 0 };
  }
  
  // For hierarchy: lower index = higher authority
  // So creatorIndex should be lower than newUserIndex for valid creation
  if (creatorIndex >= newUserIndex) {
    // Creator cannot create same level or higher level
    return { isDirectSubordinate: false, upperRole: null, skipLevel: 0 };
  }
  
  const skipLevel = newUserIndex - creatorIndex;
  
  if (skipLevel === 1) {
    // Direct subordinate (e.g., SUB_OWNER creates SUB)
    return { isDirectSubordinate: true, upperRole: null, skipLevel: 1 };
  } else if (skipLevel > 1) {
    // Skip hierarchy (e.g., SUB_OWNER creates MASTER)
    // Find the immediate parent role
    const immediateParentIndex = newUserIndex - 1;
    const immediateParentRole = Object.keys(ROLE_HIERARCHY).find(role => 
      ROLE_HIERARCHY[role as Role] === immediateParentIndex
    );
    return { isDirectSubordinate: false, upperRole: immediateParentRole || null, skipLevel };
  } else {
    // Shouldn't happen
    return { isDirectSubordinate: false, upperRole: null, skipLevel };
  }
}

// Function to get display name for role
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'OWNER': return 'Owner';
    case 'SUB_OWN': return 'Sub Owner';
    case 'SUP_ADM': return 'Super Admin';
    case 'ADMIN': return 'Admin';
    case 'SUB_ADM': return 'Sub Admin';
    case 'MAS_AGENT': return 'Master Agent';
    case 'SUP_AGENT': return 'Super Agent';
    case 'AGENT': return 'Agent';
    case 'USER': return 'Client';
    default: return role;
  }
}

// Function to get modal title for hierarchy selection
export function getHierarchyModalTitle(upperRole: string): string {
  return `Select ${getRoleDisplayName(upperRole)}`;
}

// Function to check if a user can access a specific role's data
export function canAccessRole(userRole: string, targetRole: string): boolean {
  // Special handling for SUB_OWN - give full access to everything
  if (userRole === 'SUB_OWN') {
    return true;
  }
  
  const userIndex = getHierarchyIndex(userRole);
  const targetIndex = getHierarchyIndex(targetRole);
  
  if (userIndex === undefined || targetIndex === undefined) {
    return false;
  }
  
  // User can only access roles that are lower in hierarchy (higher index)
  // NOT same level or above
  return targetIndex > userIndex;
}

// Function to get accessible roles for a user
export function getAccessibleRoles(userRole: string): string[] {
  // Special handling for SUB_OWN - give access to all roles
  if (userRole === 'SUB_OWN') {
    return Object.keys(ROLE_HIERARCHY);
  }
  
  const userIndex = getHierarchyIndex(userRole);
  
  if (userIndex === undefined) {
    return [];
  }
  
  // Return all roles that are lower in hierarchy (higher index)
  // NOT same level or above
  return Object.keys(ROLE_HIERARCHY).filter(role => ROLE_HIERARCHY[role as Role] > userIndex).map(role => role);
}

// Function to check if user can access specific features
export function canAccessFeature(userRole: string, feature: string): boolean {
  // Special handling for SUB_OWN - give access to all features
  if (userRole === 'SUB_OWN') {
    return true;
  }
  
  // Map features to the minimum role required to access them
  const featureMinRole: Record<string, string> = {
    'login_reports': 'ADMIN',
    'super_admin_management': 'SUP_ADM',
    'admin_management': 'ADMIN',
    'sub_owner_management': 'SUB_OWN',
    'sub_management': 'SUB_ADM',
    'master_management': 'MAS_AGENT',
    'super_agent_management': 'SUP_AGENT',
    'agent_management': 'AGENT',
    'client_management': 'USER',
  };
  const userIndex = getHierarchyIndex(userRole);
  const minRole = featureMinRole[feature];
  if (!minRole) return false;
  const minIndex = getHierarchyIndex(minRole);
  // User can access the feature if the feature's min role is below the user's role
  return minIndex > userIndex;
}

// Function to check if user can access restricted sections (COMMISSIONS, OLD DATA, LOGIN REPORTS)
export function canAccessRestrictedSections(userRole: string): boolean {
  // Only SUB_OWN and above can access these sections
  const restrictedRoles = ['SUB_OWN'];
  return restrictedRoles.includes(userRole);
}

// Function to check if a user can access another user's data based on hierarchy
export function canAccessUserData(requestingUserRole: string, targetUserRole: string): boolean {
  // Special handling for SUB_OWN - can access all user data
  if (requestingUserRole === 'SUB_OWN') {
    return true;
  }
  
  const requestingIndex = getHierarchyIndex(requestingUserRole);
  const targetIndex = getHierarchyIndex(targetUserRole);
  
  if (requestingIndex === undefined || targetIndex === undefined) {
    return false;
  }
  
  // User can only access data for users below them in hierarchy (higher index)
  // NOT same level or above
  return targetIndex > requestingIndex;
}

// Function to get role-based navigation items
export function getRoleBasedNavigation(userRole: string) {
  console.log('🔵 getRoleBasedNavigation called with role:', userRole);
  if (!userRole || typeof userRole !== 'string') {
    console.warn('🔴 Invalid userRole provided to getRoleBasedNavigation:', userRole);
    return {};
  }
  
  const userIndex = getHierarchyIndex(userRole);
  console.log('🔵 User hierarchy index:', userIndex);
  if (userIndex === 0) {
    console.warn(`🔴 Invalid role "${userRole}" provided to getRoleBasedNavigation`);
    return {};
  }

  const allNavigation = {
    'USER DETAILS': [
      { label: 'Super Admin ', href: '/user_details/super_admin', icon: 'fas fa-user-shield', role: 'SUP_ADM' },
      { label: 'Admin ', href: '/user_details/admin', icon: 'fas fa-user-shield', role: 'ADMIN' },
      { label: 'Sub Admin ', href: '/user_details/sub', icon: 'fas fa-chess-rook', role: 'SUB_ADM' },
      { label: 'Master Agent ', href: '/user_details/master', icon: 'fas fa-crown', role: 'MAS_AGENT' },
      { label: 'Super Agent ', href: '/user_details/super', icon: 'fas fa-user-tie', role: 'SUP_AGENT' },
      { label: 'Agent ', href: '/user_details/agent', icon: 'fas fa-user-shield', role: 'AGENT' },
      { label: 'Client ', href: '/user_details/client', icon: 'fas fa-user', role: 'USER' },
      { label: 'Dead Users', href: '/user_details/dead', icon: 'fa fa-user-slash', role: 'USER' },
    ],
    'GAMES': [
      { label: 'InPlay Game', href: '/game/inPlay', icon: 'fas fa-play', role: 'USER' },
      { label: 'Complete Game', href: '/game/completeGame', icon: 'far fa-stop-circle', role: 'USER' },
    ],
    'Casino': [
      { label: 'Live Casino Position', href: '#', icon: 'fas fa-chart-line', role: 'USER' },
      { label: 'Casino Details', href: '#', icon: 'fas fa-wallet', role: 'USER' },
      { label: 'Int. Casino Details', href: '#', icon: 'fas fa-chart-line', role: 'USER' },
    ],
    'CASH TRANSACTION': [
      { label: 'Debit/Credit Entry (Super Admin)', href: '/ct/super_admin', icon: 'fas fa-angle-right', role: 'SUP_ADM' },
      { label: 'Debit/Credit Entry (Admin)', href: '/ct/admin', icon: 'fas fa-angle-right', role: 'ADMIN' },
      { label: 'Debit/Credit Entry (Sub)', href: '/ct/sub', icon: 'fas fa-angle-right', role: 'SUB_ADM' },
      { label: 'Debit/Credit Entry (M)', href: '/ct/master', icon: 'fas fa-angle-right', role: 'MAS_AGENT' },
      { label: 'Debit/Credit Entry (S)', href: '/ct/super', icon: 'fas fa-angle-right', role: 'SUP_AGENT' },
      { label: 'Debit/Credit Entry (A)', href: '/ct/agent', icon: 'fas fa-angle-right', role: 'AGENT' },
      { label: 'Debit/Credit Entry (C)', href: '/ct/client', icon: 'fas fa-angle-right', role: 'USER' },
    ],
    'LEDGER': [
      { label: 'My Ledger', href: '/ledger', icon: 'fas fa-angle-right', role: 'USER' },
      { label: 'All Super Admin Ledger', href: '/ledger/super_admin', icon: 'fas fa-angle-right', role: 'SUP_ADM' },
      { label: 'All Admin Ledger', href: '/ledger/admin', icon: 'fas fa-angle-right', role: 'ADMIN' },
      { label: 'All Sub Ledger', href: '/ledger/sub', icon: 'fas fa-angle-right', role: 'SUB_ADM' },
      { label: 'All Master Ledger', href: '/ledger/master', icon: 'fas fa-angle-right', role: 'MAS_AGENT' },
      { label: 'All Super Ledger', href: '/ledger/super', icon: 'fas fa-angle-right', role: 'SUP_AGENT' },
      { label: 'All Agent Ledger', href: '/ledger/agent', icon: 'fas fa-angle-right', role: 'AGENT' },
      { label: 'All Client Ledger', href: '/ledger/client', icon: 'fas fa-angle-right', role: 'USER' },
      { label: 'Client Plus/Minus', href: '/ledger/client/pm', icon: 'fas fa-angle-right', role: 'USER' },
    ],
    'COMMISSIONS': [
      { label: 'Commission Dashboard', href: '/commissions', icon: 'fas fa-coins', role: 'USER' },
    ],
    'OLD DATA': [
      { label: 'Old Ledger', href: '#', icon: 'fas fa-angle-right', role: 'USER' },
      { label: 'Old Casino Data', href: '#', icon: 'fas fa-angle-right', role: 'USER' },
    ],
    'Login Reports': [
      { label: 'All Login Reports', href: '/reports/login-reports', icon: 'fas fa-clipboard-list', role: 'ADMIN' },
      { label: 'Super Admin Login Reports', href: '/reports/login-reports?role=SUP_ADM', icon: 'fas fa-clipboard-list', role: 'SUP_ADM' },
      { label: 'Admin Login Reports', href: '/reports/login-reports?role=ADMIN', icon: 'fas fa-clipboard-list', role: 'ADMIN' },
      { label: 'Sub Login Reports', href: '/reports/login-reports?role=SUB_ADM', icon: 'fas fa-clipboard-list', role: 'SUB_ADM' },
      { label: 'Master Login Reports', href: '/reports/login-reports?role=MAS_AGENT', icon: 'fas fa-clipboard-list', role: 'MAS_AGENT' },
      { label: 'Super Login Reports', href: '/reports/login-reports?role=SUP_AGENT', icon: 'fas fa-clipboard-list', role: 'SUP_AGENT' },
      { label: 'Agent Login Reports', href: '/reports/login-reports?role=AGENT', icon: 'fas fa-clipboard-list', role: 'AGENT' },
    ],
  };

  // Special handling for SUB_OWN - give full access to everything
  if (userRole === 'SUB_OWN') {
    console.log('🔵 SUB_OWN user - returning full navigation');
    return allNavigation;
  }
  
  const filteredNavigation: Record<string, any[]> = {};
  
  Object.entries(allNavigation).forEach(([section, links]) => {
    // Check if this is a restricted section
    const isRestrictedSection = ['COMMISSIONS', 'OLD DATA', 'Login Reports'].includes(section);
    
    if (isRestrictedSection) {
      // Only show restricted sections to SUB_OWNER and above
      if (canAccessRestrictedSections(userRole)) {
        // For restricted sections, filter links based on hierarchy (only show roles below user)
        const filteredLinks = links.filter(link => {
          const linkIndex = getHierarchyIndex(link.role);
          return linkIndex > userIndex; // Only show links for roles below the user
        });
        if (filteredLinks.length > 0) {
          filteredNavigation[section] = filteredLinks;
        }
      }
      // If user can't access restricted sections, don't add them at all
    } else {
      // For non-restricted sections, filter links based on hierarchy (only show roles below user)
      const filteredLinks = links.filter(link => {
        const linkIndex = getHierarchyIndex(link.role);
        return linkIndex > userIndex; // Only show links for roles below the user
      });
      if (filteredLinks.length > 0) {
        filteredNavigation[section] = filteredLinks;
      }
    }
  });
  
  console.log('🔵 Final filtered navigation:', filteredNavigation);
  return filteredNavigation;
}
