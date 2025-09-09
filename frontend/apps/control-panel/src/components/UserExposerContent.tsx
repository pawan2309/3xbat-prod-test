import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Table } from './Table';

const UserExposerContent: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  // Sample data for demonstration
  useEffect(() => {
    const sampleUsers = [
      {
        id: 1,
        userId: 'USER001',
        username: 'john_doe',
        email: 'john@example.com',
        totalBets: 45,
        totalAmount: 12500,
        totalWins: 18,
        totalLosses: 27,
        winRate: 40.0,
        riskLevel: 'Medium',
        status: 'Active',
        lastLogin: '2024-01-15 14:30:00',
        registrationDate: '2024-01-01 10:00:00',
        currentBalance: 2500
      },
      {
        id: 2,
        userId: 'USER002',
        username: 'jane_smith',
        email: 'jane@example.com',
        totalBets: 78,
        totalAmount: 45000,
        totalWins: 45,
        totalLosses: 33,
        winRate: 57.7,
        riskLevel: 'Low',
        status: 'Active',
        lastLogin: '2024-01-15 16:45:00',
        registrationDate: '2024-01-05 14:20:00',
        currentBalance: 12000
      },
      {
        id: 3,
        userId: 'USER003',
        username: 'mike_wilson',
        email: 'mike@example.com',
        totalBets: 156,
        totalAmount: 89000,
        totalWins: 67,
        totalLosses: 89,
        winRate: 42.9,
        riskLevel: 'High',
        status: 'Suspended',
        lastLogin: '2024-01-14 20:15:00',
        registrationDate: '2023-12-15 09:30:00',
        currentBalance: 500
      },
      {
        id: 4,
        userId: 'USER004',
        username: 'sarah_jones',
        email: 'sarah@example.com',
        totalBets: 23,
        totalAmount: 5600,
        totalWins: 12,
        totalLosses: 11,
        winRate: 52.2,
        riskLevel: 'Low',
        status: 'Active',
        lastLogin: '2024-01-15 18:20:00',
        registrationDate: '2024-01-10 16:45:00',
        currentBalance: 3200
      },
      {
        id: 5,
        userId: 'USER005',
        username: 'alex_brown',
        email: 'alex@example.com',
        totalBets: 234,
        totalAmount: 156000,
        totalWins: 89,
        totalLosses: 145,
        winRate: 38.0,
        riskLevel: 'Very High',
        status: 'Banned',
        lastLogin: '2024-01-12 22:30:00',
        registrationDate: '2023-11-20 11:15:00',
        currentBalance: 0
      }
    ];
    
    setUsers(sampleUsers);
  }, []);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSuspendUser = (userId: number) => {
    console.log('Suspending user:', userId);
    alert(`Suspending user ${userId}`);
  };

  const handleBanUser = (userId: number) => {
    console.log('Banning user:', userId);
    alert(`Banning user ${userId}`);
  };

  const handleUnbanUser = (userId: number) => {
    console.log('Unbanning user:', userId);
    alert(`Unbanning user ${userId}`);
  };

  const handleViewDetails = (userId: number) => {
    console.log('Viewing details for user:', userId);
    alert(`Viewing details for user ${userId}`);
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    
    console.log(`${action} selected users:`, selectedUsers);
    alert(`${action} ${selectedUsers.length} selected users`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Refreshing users...');
    }, 1000);
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.status === 'Active';
    if (filter === 'suspended') return user.status === 'Suspended';
    if (filter === 'banned') return user.status === 'Banned';
    if (filter === 'high-risk') return user.riskLevel === 'High' || user.riskLevel === 'Very High';
    return true;
  });

  const columns = [
    { key: 'select', label: '' },
    { key: 'userId', label: 'User ID' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'totalBets', label: 'Total Bets' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'winRate', label: 'Win Rate' },
    { key: 'riskLevel', label: 'Risk Level' },
    { key: 'status', label: 'Status' },
    { key: 'currentBalance', label: 'Balance' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = filteredUsers.map(user => ({
    ...user,
    select: (
      <input
        type="checkbox"
        checked={selectedUsers.includes(user.id)}
        onChange={() => handleSelectUser(user.id)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
    ),
    totalAmount: `$${user.totalAmount.toLocaleString()}`,
    winRate: `${user.winRate}%`,
    currentBalance: `$${user.currentBalance.toLocaleString()}`,
    riskLevel: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        user.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
        user.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
        user.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
        'bg-red-100 text-red-800'
      }`}>
        {user.riskLevel}
      </span>
    ),
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        user.status === 'Active' ? 'bg-green-100 text-green-800' :
        user.status === 'Suspended' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {user.status}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <Button
          size="small"
          variant="primary"
          onClick={() => handleViewDetails(user.id)}
        >
          View
        </Button>
        {user.status === 'Active' ? (
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleSuspendUser(user.id)}
          >
            Suspend
          </Button>
        ) : user.status === 'Suspended' ? (
          <Button
            size="small"
            variant="primary"
            onClick={() => handleUnbanUser(user.id)}
          >
            Unsuspend
          </Button>
        ) : (
          <Button
            size="small"
            variant="primary"
            onClick={() => handleUnbanUser(user.id)}
          >
            Unban
          </Button>
        )}
        {user.status !== 'Banned' && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleBanUser(user.id)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Ban
          </Button>
        )}
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 User Risk Management</h1>
          <p className="text-gray-600 mt-1">Monitor user activity and manage risk levels</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            size="medium"
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">High Risk</h3>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.riskLevel === 'High' || u.riskLevel === 'Very High').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">🚫</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Banned</h3>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'Banned').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="high-risk">High Risk</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-600">
              {selectedUsers.length} of {filteredUsers.length} selected
            </div>
            <div className="flex space-x-2">
              <Button
                size="small"
                variant="primary"
                onClick={() => handleBulkAction('Suspend')}
                disabled={selectedUsers.length === 0}
              >
                Suspend Selected
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => handleBulkAction('Ban')}
                disabled={selectedUsers.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Ban Selected
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* User Risk Management Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User List</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor user activity, risk levels, and account status</p>
        </div>
        <div className="p-6">
          <Table columns={columns} rows={rows} />
        </div>
      </div>
    </div>
  );
};

export default UserExposerContent;