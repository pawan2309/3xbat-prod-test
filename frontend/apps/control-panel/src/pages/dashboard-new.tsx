import React, { useState } from 'react';
import { 
  MatchTable, 
  BetTable,
  useMatches, 
  useDashboard, 
  useBets,
  Match, 
  Bet,
  DashboardStats,
  matchService,
  betService
} from '@3xbat/shared-data';

export default function DashboardNew() {
  const [activeTab, setActiveTab] = useState<'matches' | 'bets'>('matches');
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  // Fetch data using shared hooks
  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
    refetch: refetchMatches,
    pagination: matchesPagination,
    setPage: setMatchesPage
  } = useMatches({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const {
    bets,
    loading: betsLoading,
    error: betsError,
    refetch: refetchBets,
    pagination: betsPagination,
    setPage: setBetsPage
  } = useBets({
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

  const handleToggleClientVisibility = async (matchId: string, visible: boolean) => {
    try {
      const response = await matchService.toggleClientVisibility(matchId, visible);
      if (response.success) {
        refetchMatches();
      } else {
        alert(`Failed to update visibility: ${response.error}`);
      }
    } catch (error) {
      alert(`Error updating visibility: ${error}`);
    }
  };

  const handleDeclareResult = async (matchId: string) => {
    const result = prompt('Enter match result:');
    if (result) {
      try {
        const response = await matchService.declareResult(matchId, { result });
        if (response.success) {
          refetchMatches();
        } else {
          alert(`Failed to declare result: ${response.error}`);
        }
      } catch (error) {
        alert(`Error declaring result: ${error}`);
      }
    }
  };

  const handleBulkToggleVisibility = async (visible: boolean) => {
    if (selectedMatches.length === 0) {
      alert('Please select matches first');
      return;
    }

    try {
      const promises = selectedMatches.map(matchId => 
        matchService.toggleClientVisibility(matchId, visible)
      );
      await Promise.all(promises);
      setSelectedMatches([]);
      refetchMatches();
    } catch (error) {
      alert(`Error updating visibility: ${error}`);
    }
  };

  const handleUpdateBetStatus = async (betId: string, status: string) => {
    try {
      const response = await betService.updateBetStatus(betId, status);
      if (response.success) {
        refetchBets();
      } else {
        alert(`Failed to update bet status: ${response.error}`);
      }
    } catch (error) {
      alert(`Error updating bet status: ${error}`);
    }
  };

  if (statsLoading || matchesLoading) {
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
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError || matchesError) {
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
          <h1>Error Loading Dashboard</h1>
          <p>{statsError || matchesError}</p>
          <button 
            onClick={() => { refetchMatches(); }}
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
        <p style={{ margin: '10px 0 0 0', opacity: 0.8 }}>Dashboard - Match & Bet Management</p>
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
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Total Matches</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalMatches}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Active Matches</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              {stats.activeMatches}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Total Bets</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {stats.totalBets}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6b7280' }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
              {stats.totalUsers}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              padding: '12px 24px',
              borderBottom: activeTab === 'matches' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'matches' ? '#3b82f6' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Matches ({matches?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('bets')}
            style={{
              padding: '12px 24px',
              borderBottom: activeTab === 'bets' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'bets' ? '#3b82f6' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Bets ({bets?.length || 0})
          </button>
        </div>

        {/* Bulk Actions for Matches */}
        {activeTab === 'matches' && selectedMatches.length > 0 && (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <span style={{ color: '#374151', fontWeight: '500' }}>
              {selectedMatches.length} matches selected
            </span>
            <button
              onClick={() => handleBulkToggleVisibility(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Show to Clients
            </button>
            <button
              onClick={() => handleBulkToggleVisibility(false)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Hide from Clients
            </button>
            <button
              onClick={() => setSelectedMatches([])}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'matches' && (
          <MatchTable
            data={matches || []}
            loading={matchesLoading}
            error={matchesError}
            scope="dashboard"
            onToggleVisibility={handleToggleClientVisibility}
            onDeclareResult={handleDeclareResult}
            pagination={{
              page: matchesPagination.page,
              limit: matchesPagination.limit,
              total: matchesPagination.total,
              onPageChange: setMatchesPage
            }}
          />
        )}

        {activeTab === 'bets' && (
          <BetTable
            data={bets || []}
            loading={betsLoading}
            error={betsError}
            scope="dashboard"
            onUpdateStatus={handleUpdateBetStatus}
            pagination={{
              page: betsPagination.page,
              limit: betsPagination.limit,
              total: betsPagination.total,
              onPageChange: setBetsPage
            }}
          />
        )}
      </div>
    </div>
  );
}
