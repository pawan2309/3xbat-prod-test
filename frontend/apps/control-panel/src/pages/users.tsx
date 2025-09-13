import React, { useState } from 'react';
import { 
  UserTable, 
  useUsers, 
  useDashboard,
  userService,
  User
} from '@3xbat/shared-data';

export default function UsersPage() {
  const [filters, setFilters] = useState({
    role: '',
    isActive: undefined as boolean | undefined,
    search: ''
  });

  // Fetch data using shared hooks
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
    pagination: usersPagination,
    setPage: setUsersPage
  } = useUsers({
    filters,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError
  } = useDashboard({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const handleEditUser = async (userId: string) => {
    // For now, just show an alert. In a real app, you'd open a modal or navigate to edit page
    alert(`Edit user ${userId} - This would open an edit modal`);
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await userService.updateUserStatus(userId, isActive);
      if (response.success) {
        refetchUsers();
      } else {
        alert(`Failed to update user status: ${response.error}`);
      }
    } catch (error) {
      alert(`Error updating user status: ${error}`);
    }
  };

  const handleUpdateLimit = async (userId: string, creditLimit: number) => {
    try {
      const response = await userService.updateUserLimit(userId, creditLimit);
      if (response.success) {
        refetchUsers();
      } else {
        alert(`Failed to update credit limit: ${response.error}`);
      }
    } catch (error) {
      alert(`Error updating credit limit: ${error}`);
    }
  };

  const handleViewDetails = (userId: string) => {
    // For now, just show an alert. In a real app, you'd navigate to user details page
    alert(`View details for user ${userId} - This would navigate to user details page`);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (usersLoading || statsLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (usersError || statsError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#dc2626',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>
          <h1>Error Loading Users</h1>
          <p>{usersError || statsError}</p>
          <button 
            onClick={() => { refetchUsers(); }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>3xBat Control Panel</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.8 }}>User Management</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalUsers}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Active Users</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              {users?.filter(u => u.isActive).length || 0}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Admins</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {users?.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length || 0}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Agents</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
              {users?.filter(u => u.role === 'AGENT').length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Filters</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by username or name..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange({ role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="SUB_OWNER">Sub Owner</option>
                <option value="AGENT">Agent</option>
                <option value="USER">User</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                Status
              </label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => handleFilterChange({ 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UserTable
          data={users || []}
          loading={usersLoading}
          error={usersError}
          scope="user-management"
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onUpdateLimit={handleUpdateLimit}
          onViewDetails={handleViewDetails}
          pagination={{
            page: usersPagination.page,
            limit: usersPagination.limit,
            total: usersPagination.total,
            onPageChange: setUsersPage
          }}
        />
      </div>
    </div>
  );
}
