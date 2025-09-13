import React from 'react';
import { User, TableProps, ComponentScope } from '../types';

interface UserTableProps extends Omit<TableProps<User>, 'columns'> {
  scope: ComponentScope;
  onEditUser?: (userId: string) => void;
  onToggleStatus?: (userId: string, isActive: boolean) => void;
  onUpdateLimit?: (userId: string, limit: number) => void;
  onViewDetails?: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  data,
  loading,
  error,
  scope,
  onEditUser,
  onToggleStatus,
  onUpdateLimit,
  onViewDetails,
  onRowClick,
  pagination,
  actions = []
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRole = (role: string) => {
    const roleMap: { [key: string]: { label: string; color: string } } = {
      'SUPER_ADMIN': { label: 'Super Admin', color: '#dc2626' },
      'ADMIN': { label: 'Admin', color: '#d97706' },
      'SUB_OWNER': { label: 'Sub Owner', color: '#059669' },
      'AGENT': { label: 'Agent', color: '#3b82f6' },
      'USER': { label: 'User', color: '#6b7280' }
    };
    return roleMap[role] || { label: role, color: '#6b7280' };
  };

  const getColumns = (): TableProps<User>['columns'] => {
    const baseColumns: TableProps<User>['columns'] = [
      {
        key: 'username',
        label: 'Username',
        sortable: true,
        render: (value, item) => (
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">Code: {item.code}</div>
          </div>
        )
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (value) => {
          const roleInfo = formatRole(value);
          return (
            <span
              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
            >
              {roleInfo.label}
            </span>
          );
        }
      },
      {
        key: 'contactno',
        label: 'Contact',
        render: (value) => (
          <span className="text-sm text-gray-600">{value}</span>
        )
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        render: (value) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {value ? 'Active' : 'Inactive'}
          </span>
        )
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value) => formatDate(value)
      }
    ];

    // Add scope-specific columns
    if (scope === 'dashboard' || scope === 'user-management') {
      baseColumns.splice(4, 0, {
        key: 'creditLimit',
        label: 'Credit Limit',
        sortable: true,
        render: (value) => (
          <span className="font-medium text-gray-900">
            {formatCurrency(Number(value))}
          </span>
        )
      });
    }

    if (scope === 'user-management') {
      baseColumns.splice(5, 0, {
        key: 'parent',
        label: 'Parent',
        render: (value) => (
          <div>
            {value ? (
              <>
                <div className="font-medium text-gray-900">{value.username}</div>
                <div className="text-sm text-gray-500">{value.name}</div>
              </>
            ) : (
              <span className="text-sm text-gray-400">No parent</span>
            )}
          </div>
        )
      });
    }

    if (scope === 'user-management') {
      baseColumns.push({
        key: 'userCommissionShare',
        label: 'Commission',
        render: (value) => (
          <div className="text-sm">
            {value ? (
              <div>
                <div className="font-medium text-gray-900">{value.share}%</div>
                <div className="text-gray-500">
                  {value.commissionType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">No commission</span>
            )}
          </div>
        )
      });
    }

    return baseColumns;
  };

  const getActions = (user: User) => {
    const userActions = [...actions];

    if (scope === 'dashboard' || scope === 'user-management') {
      if (onViewDetails) {
        userActions.push({
          label: 'View Details',
          onClick: () => onViewDetails(user.id),
          variant: 'secondary'
        });
      }

      if (onEditUser) {
        userActions.push({
          label: 'Edit User',
          onClick: () => onEditUser(user.id),
          variant: 'primary'
        });
      }

      if (onToggleStatus) {
        userActions.push({
          label: user.isActive ? 'Deactivate' : 'Activate',
          onClick: () => onToggleStatus(user.id, !user.isActive),
          variant: user.isActive ? 'danger' : 'primary'
        });
      }

      if (onUpdateLimit) {
        userActions.push({
          label: 'Update Limit',
          onClick: () => {
            const newLimit = prompt('Enter new credit limit:', String(user.creditLimit));
            if (newLimit && !isNaN(Number(newLimit))) {
              onUpdateLimit(user.id, Number(newLimit));
            }
          },
          variant: 'secondary'
        });
      }
    }

    return userActions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">Error loading users</div>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium">No users found</div>
          <p className="mt-2 text-gray-400">Try adjusting your filters or check back later</p>
        </div>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {getActions(data[0]).length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(user)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                    {column.render
                      ? column.render(user[column.key], user)
                      : String(user[column.key] || '')}
                  </td>
                ))}
                {getActions(user).length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {getActions(user).map((action, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(user);
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            action.variant === 'danger'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : action.variant === 'primary'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
