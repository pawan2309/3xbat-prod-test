import React from 'react';
import { Match, TableProps, ComponentScope } from '../types';

interface MatchTableProps extends Omit<TableProps<Match>, 'columns'> {
  scope: ComponentScope;
  onToggleVisibility?: (matchId: string, visible: boolean) => void;
  onDeclareResult?: (matchId: string) => void;
  onEditMatch?: (matchId: string) => void;
}

const MatchTable: React.FC<MatchTableProps> = ({
  data,
  loading,
  error,
  scope,
  onToggleVisibility,
  onDeclareResult,
  onEditMatch,
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

  const formatMatchStatus = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'not_started': { label: 'Not Started', color: '#6b7280' },
      'live': { label: 'Live', color: '#059669' },
      'completed': { label: 'Completed', color: '#d97706' },
      'cancelled': { label: 'Cancelled', color: '#dc2626' }
    };
    return statusMap[status] || { label: status, color: '#6b7280' };
  };

  const getColumns = (): TableProps<Match>['columns'] => {
    const baseColumns: TableProps<Match>['columns'] = [
      {
        key: 'matchName',
        label: 'Match',
        sortable: true,
        render: (value, item) => (
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {item.externalMatchId}</div>
          </div>
        )
      },
      {
        key: 'series',
        label: 'Series',
        sortable: true
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => {
          const statusInfo = formatMatchStatus(value);
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
        key: 'startTime',
        label: 'Start Time',
        sortable: true,
        render: (value) => formatDate(value)
      }
    ];

    // Add scope-specific columns
    if (scope === 'dashboard' || scope === 'match-management') {
      baseColumns.push({
        key: 'clientVisible',
        label: 'Client Visible',
        render: (value, item) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {value ? 'Visible' : 'Hidden'}
          </span>
        )
      });
    }

    if (scope === 'dashboard' || scope === 'match-management') {
      baseColumns.push({
        key: 'bets',
        label: 'Bets',
        render: (value) => (
          <span className="text-sm text-gray-600">
            {value?.length || 0} bets
          </span>
        )
      });
    }

    return baseColumns;
  };

  const getActions = (match: Match) => {
    const matchActions = [...actions];

    if (scope === 'dashboard' || scope === 'match-management') {
      if (onToggleVisibility) {
        matchActions.push({
          label: match.clientVisible ? 'Hide from Clients' : 'Show to Clients',
          onClick: () => onToggleVisibility(match.id, !match.clientVisible),
          variant: match.clientVisible ? 'danger' : 'primary'
        });
      }

      if (onDeclareResult && match.status === 'live') {
        matchActions.push({
          label: 'Declare Result',
          onClick: () => onDeclareResult(match.id),
          variant: 'secondary'
        });
      }

      if (onEditMatch) {
        matchActions.push({
          label: 'Edit Match',
          onClick: () => onEditMatch(match.id),
          variant: 'secondary'
        });
      }
    }

    return matchActions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">Error loading matches</div>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium">No matches found</div>
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
            {data.map((match) => (
              <tr
                key={match.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(match)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                    {column.render
                      ? column.render(match[column.key], match)
                      : String(match[column.key] || '')}
                  </td>
                ))}
                {getActions(match).length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {getActions(match).map((action, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(match);
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

export default MatchTable;
