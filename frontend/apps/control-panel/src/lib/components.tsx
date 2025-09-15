// Table components for the control panel
import React from 'react';
import { User, Match, Bet, Pagination } from './types';

interface TableProps {
  data: any[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

interface UserTableProps extends TableProps {
  data: User[];
  onEdit?: (userId: string) => void;
  onToggleStatus?: (userId: string, isActive: boolean) => void;
  onUpdateLimit?: (userId: string, creditLimit: number) => void;
  onViewDetails?: (userId: string) => void;
}

interface MatchTableProps extends TableProps {
  data: Match[];
  scope?: string;
  onToggleVisibility?: (matchId: string, visible: boolean) => void;
  onDeclareResult?: (matchId: string) => void;
}

interface BetTableProps extends TableProps {
  data: Bet[];
  scope?: string;
  onUpdateStatus?: (betId: string, status: string) => void;
}

export function UserTable({ 
  data, 
  loading, 
  error, 
  pagination,
  onEdit,
  onToggleStatus,
  onUpdateLimit,
  onViewDetails
}: UserTableProps) {
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Limit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.username}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${user.creditLimit || user.limit || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(user.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                )}
                {onToggleStatus && (
                  <button
                    onClick={() => onToggleStatus(user.id, !user.isActive)}
                    className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(user.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchTable({ 
  data, 
  loading, 
  error, 
  pagination,
  onToggleVisibility,
  onDeclareResult
}: MatchTableProps) {
  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((match) => (
            <tr key={match.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{match.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  match.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  match.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {match.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  match.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {match.isVisible ? 'Visible' : 'Hidden'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(match.startTime).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {onToggleVisibility && (
                  <button
                    onClick={() => onToggleVisibility(match.id, !match.isVisible)}
                    className={`${match.isVisible ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                  >
                    {match.isVisible ? 'Hide' : 'Show'}
                  </button>
                )}
                {onDeclareResult && match.status === 'ACTIVE' && (
                  <button
                    onClick={() => onDeclareResult(match.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Declare Result
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BetTable({ 
  data, 
  loading, 
  error, 
  pagination,
  onUpdateStatus
}: BetTableProps) {
  if (loading) return <div>Loading bets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((bet) => (
            <tr key={bet.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {bet.user?.name || bet.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {bet.match?.name || bet.matchId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${bet.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  bet.status === 'WON' ? 'bg-green-100 text-green-800' : 
                  bet.status === 'LOST' ? 'bg-red-100 text-red-800' : 
                  bet.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bet.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(bet.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {onUpdateStatus && bet.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(bet.id, 'WON')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Win
                    </button>
                    <button
                      onClick={() => onUpdateStatus(bet.id, 'LOST')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Lose
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
