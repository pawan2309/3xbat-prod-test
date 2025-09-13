import React from 'react';
import { Bet, TableProps, ComponentScope } from '../types';

interface BetTableProps extends Omit<TableProps<Bet>, 'columns'> {
  scope: ComponentScope;
  onUpdateStatus?: (betId: string, status: string) => void;
  onViewDetails?: (betId: string) => void;
  onRefundBet?: (betId: string) => void;
}

const BetTable: React.FC<BetTableProps> = ({
  data,
  loading,
  error,
  scope,
  onUpdateStatus,
  onViewDetails,
  onRefundBet,
  onRowClick,
  pagination,
  actions = []
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatBetStatus = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'PENDING': { label: 'Pending', color: '#d97706' },
      'WON': { label: 'Won', color: '#059669' },
      'LOST': { label: 'Lost', color: '#dc2626' },
      'VOID': { label: 'Void', color: '#6b7280' },
      'CANCELED': { label: 'Canceled', color: '#6b7280' }
    };
    return statusMap[status] || { label: status, color: '#6b7280' };
  };

  const formatBetCategory = (category: string) => {
    const categoryMap: { [key: string]: { label: string; color: string } } = {
      'MATCH': { label: 'Match', color: '#3b82f6' },
      'SESSION': { label: 'Session', color: '#8b5cf6' },
      'CASINO': { label: 'Casino', color: '#f59e0b' }
    };
    return categoryMap[category] || { label: category, color: '#6b7280' };
  };

  const getColumns = (): TableProps<Bet>['columns'] => {
    const baseColumns: TableProps<Bet>['columns'] = [
      {
        key: 'id',
        label: 'Bet ID',
        render: (value) => (
          <span className="font-mono text-sm text-gray-600">
            {String(value).substring(0, 8)}...
          </span>
        )
      },
      {
        key: 'marketName',
        label: 'Market',
        sortable: true
      },
      {
        key: 'odds',
        label: 'Odds',
        sortable: true,
        render: (value) => (
          <span className="font-medium text-gray-900">
            {Number(value).toFixed(2)}
          </span>
        )
      },
      {
        key: 'stake',
        label: 'Stake',
        sortable: true,
        render: (value) => (
          <span className="font-medium text-gray-900">
            {formatCurrency(Number(value))}
          </span>
        )
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => {
          const statusInfo = formatBetStatus(value);
          return (
            <span
              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
            >
              {statusInfo.label}
            </span>
          );
        }
      },
      {
        key: 'betCategory',
        label: 'Category',
        sortable: true,
        render: (value) => {
          const categoryInfo = formatBetCategory(value);
          return (
            <span
              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
            >
              {categoryInfo.label}
            </span>
          );
        }
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value) => formatDate(value)
      }
    ];

    // Add scope-specific columns
    if (scope === 'dashboard' || scope === 'bet-management') {
      baseColumns.splice(1, 0, {
        key: 'user',
        label: 'User',
        render: (value) => (
          <div>
            <div className="font-medium text-gray-900">{value?.username}</div>
            <div className="text-sm text-gray-500">{value?.name}</div>
          </div>
        )
      });
    }

    if (scope === 'dashboard' || scope === 'bet-management') {
      baseColumns.splice(2, 0, {
        key: 'matchId',
        label: 'Match',
        render: (value, item) => (
          <div>
            <div className="font-medium text-gray-900">{(item as any).match?.matchName || 'N/A'}</div>
            <div className="text-sm text-gray-500">ID: {(item as any).match?.externalMatchId || item.matchId}</div>
          </div>
        )
      });
    }

    // Add potential winnings column for certain scopes
    if (scope === 'dashboard' || scope === 'bet-management') {
      baseColumns.push({
        key: 'stake',
        label: 'Potential Win',
        render: (value, item) => {
          const potentialWin = Number(value) * Number(item.odds);
          return (
            <span className="font-medium text-gray-900">
              {formatCurrency(potentialWin)}
            </span>
          );
        }
      });
    }

    return baseColumns;
  };

  const getActions = (bet: Bet) => {
    const betActions = [...actions];

    if (scope === 'dashboard' || scope === 'bet-management') {
      if (onViewDetails) {
        betActions.push({
          label: 'View Details',
          onClick: () => onViewDetails(bet.id),
          variant: 'secondary'
        });
      }

      if (onUpdateStatus && bet.status === 'PENDING') {
        betActions.push({
          label: 'Mark as Won',
          onClick: () => onUpdateStatus(bet.id, 'WON'),
          variant: 'primary'
        });
        betActions.push({
          label: 'Mark as Lost',
          onClick: () => onUpdateStatus(bet.id, 'LOST'),
          variant: 'danger'
        });
      }

      if (onRefundBet && (bet.status === 'PENDING' || bet.status === 'WON')) {
        betActions.push({
          label: 'Refund',
          onClick: () => onRefundBet(bet.id),
          variant: 'secondary'
        });
      }
    }

    return betActions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">Error loading bets</div>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium">No bets found</div>
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
            {data.map((bet) => (
              <tr
                key={bet.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(bet)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                    {column.render
                      ? column.render(bet[column.key], bet)
                      : String(bet[column.key] || '')}
                  </td>
                ))}
                {getActions(bet).length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {getActions(bet).map((action, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(bet);
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

export default BetTable;
