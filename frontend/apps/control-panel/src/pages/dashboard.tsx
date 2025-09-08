import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { Button } from "../components/Button";
import { apiFetch } from "../lib/apiClient";

interface Match {
  id: string;
  matchId: string;
  bmarketId?: string;
  beventId?: string;
  matchName: string;
  tournament: string;
  date: string;
  time: string;
  dateObj: Date;
  sport: string;
  status: string;
  externalId: string;
  gameId: string;
  title: string;
  isLive: boolean;
}

function Dashboard() {
  const router = useRouter();
  const [selectedMatchType, setSelectedMatchType] = useState("INPLAY");
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Filter matches based on selected match type
  const filterMatches = (matches: Match[], matchType: string): Match[] => {
    const currentTime = new Date();
    
    switch (matchType) {
      case "INPLAY":
        return matches.filter(match => {
          if (match.isLive === true) return true;
          const status = match.status?.toLowerCase() || '';
          if (status.includes('live') || status.includes('inplay') || status.includes('in_play')) return true;
          
          const matchDateTime = match.dateObj || new Date();
          const timeDiff = matchDateTime.getTime() - currentTime.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          const hasStarted = matchDateTime <= currentTime;
          const isWithinLiveWindow = hasStarted && hoursDiff >= -8 && hoursDiff <= 0;
          const hasFutureDate = matchDateTime > currentTime;
          
          return isWithinLiveWindow && !hasFutureDate;
        });
      case "UPCOMING":
        return matches.filter(match => {
          const matchDateTime = match.dateObj || new Date();
          return matchDateTime > currentTime;
        });
      case "COMPLETED":
        return matches.filter(match => {
          const matchDateTime = match.dateObj || new Date();
          const timeDiff = matchDateTime.getTime() - currentTime.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          return hoursDiff < -8;
        });
      case "ABANDONED":
        return matches.filter(match => {
          const status = match.status?.toLowerCase() || '';
          return status.includes('abandoned') || status.includes('canceled') || status.includes('cancelled');
        });
      default:
        return matches;
    }
  };

  function toDateParts(rawDate: string | number | Date | undefined) {
    if (!rawDate) {
      return { 
        date: 'Unknown', 
        time: 'Unknown',
        dateObj: new Date() 
      };
    }
    const d = new Date(rawDate);
    return { 
      date: d.toLocaleDateString(), 
      time: d.toLocaleTimeString(),
      dateObj: d 
    };
  }

  function normalizeRawMatch(raw: any): Match | null {
    try {
      const beventId = raw?.beventId || raw?.eventId || (raw?.event && raw.event.id) || null;
      const bmarketId = raw?.bmarketId || raw?.marketId || raw?.bettingMarketId || null;
      
      const id = beventId || raw?.id || raw?.eventId || raw?.matchId || raw?._id;
      if (!id) return null;
      
      let name = raw?.name ?? raw?.matchName ?? raw?.ename ?? '';
      
      if (!name && raw?.teams && Array.isArray(raw?.teams) && raw?.teams.length >= 2) {
        name = `${raw.teams[0]?.name || 'Team 1'} vs ${raw.teams[1]?.name || 'Team 2'}`;
      }
      
      if (!name) {
        name = `${raw?.team1 ?? raw?.teamA ?? 'Team 1'} vs ${raw?.team2 ?? raw?.teamB ?? 'Team 2'}`;
      }

      const tournament = raw?.tournament ?? raw?.series ?? raw?.league ?? raw?.cname ?? 'Cricket';
      
      let status = raw?.status;
      if (typeof status === 'string') {
        const statusLower = status.toLowerCase();
        if (statusLower === 'open' || statusLower === 'scheduled') {
          status = 'Upcoming';
        } else if (statusLower === 'live' || statusLower === 'inplay' || statusLower === 'in_play') {
          status = 'Live';
        } else if (statusLower === 'completed' || statusLower === 'finished' || statusLower === 'resulted') {
          status = 'Completed';
        } else if (statusLower === 'abandoned' || statusLower === 'canceled' || statusLower === 'cancelled') {
          status = 'Abandoned';
        }
      } else {
        status = raw?.inPlay ? 'Live' : 'Upcoming';
      }
      
      const startTime = raw?.startTime ?? raw?.start_time ?? raw?.startDate ?? raw?.stime ?? raw?.edate;
      const { date, time, dateObj } = toDateParts(startTime);
      
      const isLive = Boolean(
        raw?.inPlay || 
        raw?.isLive || 
        raw?.status === 'LIVE' ||
        status?.toLowerCase() === 'live' ||
        status?.toLowerCase() === 'inplay' ||
        status?.toLowerCase() === 'in_play'
      );
      
      const hasFutureDate = dateObj > new Date();
      const finalIsLive = isLive && !hasFutureDate;

      return {
        id,
        matchId: id,
        bmarketId: bmarketId || raw?.marketId || raw?.bmId || undefined,
        beventId: beventId || raw?.eventId || raw?.id || undefined,
        matchName: name || 'Match',
        tournament,
        date,
        time,
        dateObj,
        sport: 'Cricket',
        status,
        externalId: beventId || raw?.eventId || raw?.id || id,
        gameId: id,
        title: name || 'Match',
        isLive: finalIsLive
      };
    } catch (error) {
      console.error('Error normalizing match:', error, 'Raw data:', raw);
      return null;
    }
  }

  // Load matches from API or use demo data
  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API first
      try {
        const response = await apiFetch('/api/cricket/matches');
        
        if (response.ok) {
          const data = await response.json();
          const matchList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
          
          const normalized: Match[] = [];
          for (const raw of matchList) {
            const m = normalizeRawMatch(raw);
            if (m) normalized.push(m);
          }
          
          setAllMatches(normalized);
          const filtered = filterMatches(normalized, selectedMatchType);
          setMatches(filtered);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using demo data');
      }

      // Use demo data if API is not available
      const demoMatches: Match[] = [
        {
          id: 'demo1',
          matchId: 'demo1',
          bmarketId: 'BM001',
          beventId: 'EV001',
          matchName: 'India vs Australia',
          tournament: 'World Cup 2024',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          dateObj: new Date(),
          sport: 'Cricket',
          status: 'Live',
          externalId: 'EV001',
          gameId: 'demo1',
          title: 'India vs Australia',
          isLive: true
        },
        {
          id: 'demo2',
          matchId: 'demo2',
          bmarketId: 'BM002',
          beventId: 'EV002',
          matchName: 'England vs Pakistan',
          tournament: 'T20 World Cup',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: '14:30:00',
          dateObj: new Date(Date.now() + 24 * 60 * 60 * 1000),
          sport: 'Cricket',
          status: 'Upcoming',
          externalId: 'EV002',
          gameId: 'demo2',
          title: 'England vs Pakistan',
          isLive: false
        },
        {
          id: 'demo3',
          matchId: 'demo3',
          bmarketId: 'BM003',
          beventId: 'EV003',
          matchName: 'South Africa vs New Zealand',
          tournament: 'Test Series',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: '10:00:00',
          dateObj: new Date(Date.now() - 24 * 60 * 60 * 1000),
          sport: 'Cricket',
          status: 'Completed',
          externalId: 'EV003',
          gameId: 'demo3',
          title: 'South Africa vs New Zealand',
          isLive: false
        }
      ];
      
      setAllMatches(demoMatches);
      const filtered = filterMatches(demoMatches, selectedMatchType);
      setMatches(filtered);
      
    } catch (err: any) {
      console.error('Error loading matches:', err);
      setError(err?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  // Load matches when component mounts or match type changes
  useEffect(() => {
    loadMatches();
  }, [selectedMatchType]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get match count by filter type
  const getFilterCount = (filterType: string) => {
    return filterMatches(allMatches, filterType).length;
  };

  return (
    <Layout>
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '18px',
            color: '#6b7280'
          }}>
            Loading matches...
          </div>
        )}
        
        <div style={{ padding: '20px' }}>
          {/* Quick Filter Buttons */}
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedMatchType === 'INPLAY' ? '#059669' : '#e5e7eb',
                  color: selectedMatchType === 'INPLAY' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => setSelectedMatchType('INPLAY')}
              >
                In-Play (Live) ({getFilterCount('INPLAY')})
              </button>
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedMatchType === 'UPCOMING' ? '#2563eb' : '#e5e7eb',
                  color: selectedMatchType === 'UPCOMING' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => setSelectedMatchType('UPCOMING')}
              >
                Upcoming ({getFilterCount('UPCOMING')})
              </button>
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedMatchType === 'COMPLETED' ? '#2563eb' : '#e5e7eb',
                  color: selectedMatchType === 'COMPLETED' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => setSelectedMatchType('COMPLETED')}
              >
                Completed ({getFilterCount('COMPLETED')})
              </button>
              <button 
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedMatchType === 'ABANDONED' ? '#dc2626' : '#e5e7eb',
                  color: selectedMatchType === 'ABANDONED' ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => setSelectedMatchType('ABANDONED')}
              >
                Abandoned ({getFilterCount('ABANDONED')})
              </button>
            </div>
          </div>

          {/* Matches Table */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#17445A',
              color: 'white',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Cricket Matches - {selectedMatchType}
            </div>
            
            {error && (
              <div style={{
                padding: '16px',
                color: '#dc2626',
                background: '#fee2e2',
                border: '1px solid #fecaca'
              }}>
                Error: {error}
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: '#1e3a8a',
                    color: 'white'
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Sr No.</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Match ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Match Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Tournament</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date & Time</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        No matches found for {selectedMatchType}
                      </td>
                    </tr>
                  ) : (
                    matches.map((match, index) => (
                      <tr key={match.id} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb'
                      }}>
                        <td style={{ padding: '12px' }}>{index + 1}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: '#2563eb' }}>
                            {match.beventId ? (
                              <>
                                <div>{match.beventId}</div>
                                {match.bmarketId && <div style={{ fontSize: '12px' }}>({match.bmarketId})</div>}
                              </>
                            ) : match.id}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '500' }}>{match.matchName}</div>
                          {match.isLive && selectedMatchType === 'INPLAY' && (
                            <span style={{ color: '#059669', fontSize: '12px' }}>● LIVE</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>{match.tournament}</td>
                        <td style={{ padding: '12px' }}>
                          <div>{match.date}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{match.time}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: match.status === 'Live' ? '#dcfce7' : 
                                       match.status === 'Completed' ? '#dbeafe' :
                                       match.status === 'Abandoned' ? '#fee2e2' : '#f3f4f6',
                            color: match.status === 'Live' ? '#059669' :
                                   match.status === 'Completed' ? '#2563eb' :
                                   match.status === 'Abandoned' ? '#dc2626' : '#6b7280'
                          }}>
                            {match.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Button 
                              variant="primary" 
                              size="small"
                              onClick={() => router.push(`/matchEdit/${match.bmarketId || match.id}`)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="small"
                              onClick={() => router.push(`/dashboard/fancy-decision?matchId=${match.id}`)}
                            >
                              Fancy
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

export default Dashboard;
