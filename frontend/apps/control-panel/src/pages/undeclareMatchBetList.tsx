import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { apiFetch } from "../lib/apiClient";

interface BetData {
  id: string;
  srNo: number;
  odds: string;
  oddsType: string;
  amount: number;
  type: string;
  marketId: string;
  team: string;
  client: string;
  date: string;
  loss: number;
  profit: number;
  marketScope: "match" | "session";
}

export default function UndeclareMatchBetList() {
  const [filters, setFilters] = useState({
    marketId: "",
    username: "",
    showList: "10"
  });

  const [betData, setBetData] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [matchScopeBets, setMatchScopeBets] = useState<BetData[]>([]);
  const [sessionScopeBets, setSessionScopeBets] = useState<BetData[]>([]);

  // Load initial data when component mounts
  useEffect(() => {
    handleApply();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Applying filters:", filters);
      
      const response = await fetch('/api/undeclare-bets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setBetData(result.data || []);
        setMatchScopeBets(result.matchScopeBets || []);
        setSessionScopeBets(result.sessionScopeBets || []);
        console.log('✅ Fetched bet data:', result);
      } else {
        console.error('❌ API returned error:', result.error);
        setError(result.error || 'Failed to fetch data');
        setBetData([]);
      }
      
    } catch (error) {
      console.error("Error fetching bet data:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      setBetData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const totalMatchBets = matchScopeBets.length;
  const totalSessionBets = sessionScopeBets.length;

  const matchScopeColumns = [
    { key: "srNo", label: "Sr no.", width: "80px" },
    { key: "odds", label: "Odds", width: "100px" },
    { key: "oddsType", label: "OddsType", width: "100px" },
    { key: "amount", label: "Amount", width: "100px" },
    { key: "type", label: "Type", width: "100px" },
    { key: "marketId", label: "Market Id", width: "120px" },
    { key: "team", label: "Team", width: "150px" },
    { key: "client", label: "Client", width: "120px" },
    { key: "date", label: "Date", width: "120px" },
    { key: "loss", label: "Loss", width: "100px" },
    { key: "profit", label: "Profit", width: "100px" }
  ];

  const sessionScopeColumns = [
    { key: "srNo", label: "Sr no.", width: "80px" },
    { key: "odds", label: "Odds", width: "100px" },
    { key: "amount", label: "Amount", width: "100px" },
    { key: "type", label: "Type", width: "100px" },
    { key: "marketId", label: "MarketId", width: "120px" },
    { key: "team", label: "SessionName", width: "200px" },
    { key: "client", label: "Client", width: "120px" },
    { key: "date", label: "Date", width: "120px" },
    { key: "loss", label: "Loss", width: "100px" },
    { key: "profit", label: "Profit", width: "100px" }
  ];

  return (
    <Layout>
      <div style={{ 
        background: "#fff", 
        borderRadius: "8px", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        margin: "16px"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "#17445A",
          color: "#fff",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px"
        }}>
          <span style={{ fontSize: "20px", fontWeight: "600" }}>
            All Undeclare Bet List
          </span>
          <Button
            variant="secondary"
            size="medium"
            onClick={handleBack}
          >
            Back
          </Button>
        </div>

        {/* Filters */}
        <div style={{ padding: "16px" }}>
          {/* Error Display */}
          {error && (
            <div style={{
              padding: "12px 16px",
              marginBottom: "16px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#dc2626",
              fontSize: "14px"
            }}>
              ❌ Error: {error}
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "16px"
          }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Market Id
              </label>
              <input
                type="text"
                value={filters.marketId}
                onChange={(e) => handleFilterChange("marketId", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Username
              </label>
              <input
                type="text"
                value={filters.username}
                onChange={(e) => handleFilterChange("username", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Show List
              </label>
              <select
                value={filters.showList}
                onChange={(e) => handleFilterChange("showList", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                  background: "#fff"
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <Button
                variant="danger"
                size="medium"
                onClick={handleApply}
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Apply"}
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "16px"
          }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div>Total Match Bets: {totalMatchBets}</div>
              <div>Total Session Bets: {totalSessionBets}</div>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={handleApply}
              disabled={loading}
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </Button>
          </div>

          {/* Match Scope Bets Table */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "12px",
              color: "#17445A"
            }}>
              Match Scope Bets
            </h3>
            <Table
              columns={matchScopeColumns}
              data={matchScopeBets}
              loading={loading}
              emptyMessage="No match scope bet data available. Apply filters to load data."
            />
          </div>

          {/* Session Scope Bets Table */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "12px",
              color: "#17445A"
            }}>
              Session Scope Bets
            </h3>
            <Table
              columns={sessionScopeColumns}
              data={sessionScopeBets}
              loading={loading}
              emptyMessage="No session scope bet data available. Apply filters to load data."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
