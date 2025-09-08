import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { apiFetch } from "../lib/apiClient";

interface UserExposer {
  id: string;
  userId: string;
  username: string;
  name: string;
  totalBets: number;
  totalAmount: number;
  totalWinnings: number;
  totalLoss: number;
  netExposure: number;
  lastBetDate: string;
  status: 'active' | 'suspended' | 'inactive';
  creditLimit: number;
  currentBalance: number;
}

const tableColumns = [
  { key: "srNo", label: "Sr No.", width: "60px" },
  { key: "username", label: "Username", width: "120px" },
  { key: "name", label: "Name", width: "150px" },
  { key: "totalBets", label: "Total Bets", width: "100px" },
  { key: "totalAmount", label: "Total Amount", width: "120px" },
  { key: "totalWinnings", label: "Winnings", width: "120px" },
  { key: "totalLoss", label: "Loss", width: "120px" },
  { key: "netExposure", label: "Net Exposure", width: "120px" },
  { key: "currentBalance", label: "Balance", width: "120px" },
  { key: "creditLimit", label: "Credit Limit", width: "120px" },
  { key: "status", label: "Status", width: "100px" },
  { key: "actions", label: "Actions", width: "150px" }
];

function UserExposer() {
  const [filters, setFilters] = useState({
    username: "",
    status: "all",
    minExposure: "",
    maxExposure: ""
  });

  const [userExposers, setUserExposers] = useState<UserExposer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadUserExposers();
  }, []);

  const loadUserExposers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try API first
      try {
        const response = await apiFetch('/api/users/exposure');
        
        if (response.ok) {
          const data = await response.json();
          const exposers: UserExposer[] = Array.isArray(data?.data) ? data.data : [];
          
          // Add serial numbers
          const exposersWithSrNo = exposers.map((exposer, index) => ({
            ...exposer,
            srNo: index + 1
          }));
          
          setUserExposers(exposersWithSrNo);
          setLastFetched(new Date());
          return;
        }
      } catch (apiError) {
        console.log('API not available, using demo data');
      }

      // Use demo data
      const demoExposers: UserExposer[] = [
        {
          id: '1',
          userId: 'user001',
          username: 'john_doe',
          name: 'John Doe',
          totalBets: 45,
          totalAmount: 125000,
          totalWinnings: 85000,
          totalLoss: 40000,
          netExposure: 45000,
          lastBetDate: new Date().toLocaleDateString(),
          status: 'active',
          creditLimit: 100000,
          currentBalance: 55000
        },
        {
          id: '2',
          userId: 'user002',
          username: 'jane_smith',
          name: 'Jane Smith',
          totalBets: 32,
          totalAmount: 75000,
          totalWinnings: 60000,
          totalLoss: 15000,
          netExposure: 45000,
          lastBetDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'active',
          creditLimit: 50000,
          currentBalance: 35000
        },
        {
          id: '3',
          userId: 'user003',
          username: 'mike_wilson',
          name: 'Mike Wilson',
          totalBets: 28,
          totalAmount: 95000,
          totalWinnings: 35000,
          totalLoss: 60000,
          netExposure: -25000,
          lastBetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'suspended',
          creditLimit: 75000,
          currentBalance: 10000
        },
        {
          id: '4',
          userId: 'user004',
          username: 'sarah_jones',
          name: 'Sarah Jones',
          totalBets: 15,
          totalAmount: 30000,
          totalWinnings: 25000,
          totalLoss: 5000,
          netExposure: 20000,
          lastBetDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: 'inactive',
          creditLimit: 25000,
          currentBalance: 20000
        }
      ];
      
      // Add serial numbers
      const exposersWithSrNo = demoExposers.map((exposer, index) => ({
        ...exposer,
        srNo: index + 1
      }));
      
      setUserExposers(exposersWithSrNo);
      setLastFetched(new Date());
      
    } catch (err) {
      console.error('Error fetching user exposure data:', err);
      setError('Error loading user exposure data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    // In a real implementation, this would filter the data
    // For now, we'll just reload the data
    loadUserExposers();
  };

  const handleRefresh = () => {
    loadUserExposers();
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action ${action} for user ${userId}`);
    // Implement user actions like suspend, activate, etc.
  };

  // Filter data based on current filters
  const filteredData = userExposers.filter(exposer => {
    if (filters.username && !exposer.username.toLowerCase().includes(filters.username.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && exposer.status !== filters.status) {
      return false;
    }
    if (filters.minExposure && exposer.netExposure < Number(filters.minExposure)) {
      return false;
    }
    if (filters.maxExposure && exposer.netExposure > Number(filters.maxExposure)) {
      return false;
    }
    return true;
  });

  // Calculate totals
  const totalExposure = filteredData.reduce((sum, exposer) => sum + exposer.netExposure, 0);
  const totalAmount = filteredData.reduce((sum, exposer) => sum + exposer.totalAmount, 0);
  const totalWinnings = filteredData.reduce((sum, exposer) => sum + exposer.totalWinnings, 0);
  const totalLoss = filteredData.reduce((sum, exposer) => sum + exposer.totalLoss, 0);

  // Prepare table data with actions
  const tableData = filteredData.map((exposer) => ({
    ...exposer,
    totalAmount: `₹${exposer.totalAmount.toLocaleString()}`,
    totalWinnings: `₹${exposer.totalWinnings.toLocaleString()}`,
    totalLoss: `₹${exposer.totalLoss.toLocaleString()}`,
    netExposure: `₹${exposer.netExposure.toLocaleString()}`,
    currentBalance: `₹${exposer.currentBalance.toLocaleString()}`,
    creditLimit: `₹${exposer.creditLimit.toLocaleString()}`,
    status: (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        background: exposer.status === 'active' ? '#dcfce7' : 
                   exposer.status === 'suspended' ? '#fee2e2' : '#f3f4f6',
        color: exposer.status === 'active' ? '#059669' :
               exposer.status === 'suspended' ? '#dc2626' : '#6b7280'
      }}>
        {exposer.status.toUpperCase()}
      </span>
    ),
    actions: (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <Button 
          variant="info" 
          size="small" 
          onClick={() => handleUserAction(exposer.userId, 'view')}
        >
          View
        </Button>
        <Button 
          variant="warning" 
          size="small" 
          onClick={() => handleUserAction(exposer.userId, 'suspend')}
        >
          Suspend
        </Button>
        <Button 
          variant="danger" 
          size="small" 
          onClick={() => handleUserAction(exposer.userId, 'limit')}
        >
          Limit
        </Button>
      </div>
    )
  }));

  return (
    <Layout>
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: '#17445A',
              color: 'white',
              padding: '20px',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              User Exposure Management
            </div>

            {/* Filters */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={filters.username}
                    onChange={(e) => handleFilterChange('username', e.target.value)}
                    placeholder="Search by username"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Min Exposure
                  </label>
                  <input
                    type="number"
                    value={filters.minExposure}
                    onChange={(e) => handleFilterChange('minExposure', e.target.value)}
                    placeholder="Min amount"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Max Exposure
                  </label>
                  <input
                    type="number"
                    value={filters.maxExposure}
                    onChange={(e) => handleFilterChange('maxExposure', e.target.value)}
                    placeholder="Max amount"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  disabled={loading}
                >
                  Apply Filters
                </Button>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {lastFetched && (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Last updated: {lastFetched.toLocaleTimeString()}
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : '🔄 Refresh'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ 
              padding: '20px', 
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Users</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#374151' }}>{filteredData.length}</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Exposure</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>₹{totalExposure.toLocaleString()}</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Amount</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#374151' }}>₹{totalAmount.toLocaleString()}</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Net P&L</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '600', 
                    color: totalWinnings - totalLoss >= 0 ? '#059669' : '#dc2626'
                  }}>
                    ₹{(totalWinnings - totalLoss).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={{
                padding: '12px 20px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              }}>
                ❌ Error: {error}
              </div>
            )}

            {/* Table */}
            <div style={{ padding: '20px' }}>
              <Table
                columns={tableColumns}
                data={tableData}
                loading={loading}
                emptyMessage="No user exposure data available. Apply filters to load data."
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Force dynamic rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default UserExposer;
