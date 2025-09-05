# User Panel Sections Overview

## 📋 Complete List of Sections in User Panel

Based on the code analysis, here are all the sections available in the user panel:

### **1. USER DETAILS** 📊
**Purpose**: User management and administration for different roles

#### **Available Roles:**
- **Super Admin** (`/user_details/super_admin`)
  - Create, edit, view Super Admin users
  - Limit management
  - User administration

- **Admin** (`/user_details/admin`)
  - Create, edit, view Admin users
  - Limit management
  - User administration

- **Sub Agent** (`/user_details/sub`)
  - Create, edit, view Sub Agent users
  - Limit management
  - User administration

- **Master Agent** (`/user_details/master`)
  - Create, edit, view Master Agent users
  - Limit management
  - User administration

- **Super Agent** (`/user_details/super`)
  - Create, edit, view Super Agent users
  - Limit management
  - User administration

- **Agent** (`/user_details/agent`)
  - Create, edit, view Agent users
  - Limit management
  - User administration

- **Client** (`/user_details/client`)
  - Create, edit, view Client users
  - Client limit management

- **Dead Users** (`/user_details/dead`)
  - View inactive/deactivated users

#### **Common Features:**
- User creation forms
- User editing capabilities
- Limit management
- Status updates
- User search and filtering

---

### **2. CASH TRANSACTION (CT)** 💰
**Purpose**: Debit/Credit entry and financial transactions

#### **Available Sections:**
- **Super Admin CT** (`/ct/super_admin`)
- **Admin CT** (`/ct/admin`)
- **Sub CT** (`/ct/sub`)
- **Master CT** (`/ct/master`)
- **Super CT** (`/ct/super`)
- **Agent CT** (`/ct/agent`)
- **Client CT** (`/ct/client`)

#### **Features:**
- Debit/Credit entry forms
- Transaction management
- Financial operations
- Role-based access control

---

### **3. LEDGER** 📚
**Purpose**: Financial records and transaction history

#### **Available Sections:**
- **My Ledger** (`/ledger`)
- **All Super Admin Ledger** (`/ledger/super_admin`)
- **All Admin Ledger** (`/ledger/admin`)
- **All Sub Ledger** (`/ledger/sub`)
- **All Master Ledger** (`/ledger/master`)
- **All Super Ledger** (`/ledger/super`)
- **All Agent Ledger** (`/ledger/agent`)
- **All Client Ledger** (`/ledger/client`)
- **Client Plus/Minus** (`/ledger/client/pm`)

#### **Features:**
- Transaction history
- Financial records
- Balance tracking
- Transaction filtering
- Export capabilities

---

### **4. GAMES** 🎮
**Purpose**: Game management and betting operations

#### **Available Sections:**
- **InPlay Game** (`/game/inPlay`)
- **Complete Game** (`/game/completeGame`)

#### **Features:**
- Live game management
- Game status tracking
- Betting operations
- Game completion handling

---

### **5. CASINO** 🎰
**Purpose**: Casino operations and management

#### **Available Sections:**
- **Live Casino Position** (Coming Soon)
- **Casino Details** (Coming Soon)
- **Int. Casino Details** (Coming Soon)

#### **Features:**
- Casino position tracking
- Casino financial details
- International casino operations

---

### **6. COMMISSIONS** 💎
**Purpose**: Commission management and reporting

#### **Available Sections:**
- **Commission Dashboard** (`/commissions`)

#### **Features:**
- Commission calculations
- Commission reports
- Revenue sharing
- Commission tracking

---

### **7. OLD DATA** 📁
**Purpose**: Historical data access

#### **Available Sections:**
- **Old Ledger** (Coming Soon)
- **Old Casino Data** (Coming Soon)

#### **Features:**
- Historical ledger access
- Legacy casino data
- Data migration tools

---

### **8. LOGIN REPORTS** 📊
**Purpose**: User activity and login tracking

#### **Available Sections:**
- **All Login Reports** (`/reports/login-reports`)
- **Super Admin Login Reports** (`/reports/login-reports?role=SUPER_ADMIN`)
- **Admin Login Reports** (`/reports/login-reports?role=ADMIN`)
- **Sub Login Reports** (`/reports/login-reports?role=SUB`)
- **Master Login Reports** (`/reports/login-reports?role=MASTER`)
- **Super Login Reports** (`/reports/login-reports?role=SUPER_AGENT`)
- **Agent Login Reports** (`/reports/login-reports?role=AGENT`)

#### **Features:**
- Login activity tracking
- User session monitoring
- Role-based reporting
- Activity analytics

---

## 🔐 Role-Based Access Control

### **Role Hierarchy** (Highest to Lowest):
1. **OWNER** (Level 9)
2. **SUB_OWNER** (Level 8) - Full access to everything
3. **SUPER_ADMIN** (Level 7)
4. **ADMIN** (Level 6)
5. **SUB** (Level 5)
6. **MASTER** (Level 4)
7. **SUPER_AGENT** (Level 3)
8. **AGENT** (Level 2)
9. **USER** (Level 1)

### **Access Rules:**
- Users can only access sections for roles **below** them in hierarchy
- **SUB_OWNER** has access to **ALL** sections
- **Restricted sections** (COMMISSIONS, OLD DATA, LOGIN REPORTS) require SUB_OWNER level
- Each role sees only relevant sections based on their authority level

---

## 🚀 Current Status

### **✅ Fully Implemented Sections:**
- User Details (All roles)
- Cash Transaction (All roles)
- Ledger (All roles)
- Games (InPlay & Complete)
- Commissions Dashboard
- Login Reports (All roles)

### **🚧 Partially Implemented:**
- Casino sections (Placeholder links)

### **📋 Coming Soon:**
- Old Data sections
- Advanced Casino features

---

## 🎯 Navigation Structure

The navigation is dynamically generated based on:
1. **User Role** - Determines which sections are visible
2. **Hierarchy Level** - Controls access to specific role sections
3. **Feature Permissions** - Manages access to restricted features

Each section is organized with:
- **Section Headers** - Grouped by functionality
- **Role-based Links** - Filtered by user permissions
- **Icons** - Visual indicators for each section
- **Expandable Menus** - Collapsible section organization

This structure provides a comprehensive user management and betting platform with role-based access control and extensive functionality for different user types.
