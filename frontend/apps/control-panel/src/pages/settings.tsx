import React, { useState } from "react";
import Layout from "./layout";
import { Button } from "../components/Button";

interface SettingsData {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maxBetAmount: number;
  minBetAmount: number;
  commissionRate: number;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  allowDeposits: boolean;
  allowWithdrawals: boolean;
}

function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    siteName: "3xBat Betting Platform",
    siteUrl: "https://3xbat.com",
    adminEmail: "admin@3xbat.com",
    maxBetAmount: 10000,
    minBetAmount: 10,
    commissionRate: 5.0,
    maintenanceMode: false,
    allowRegistration: true,
    allowDeposits: true,
    allowWithdrawals: true
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      siteName: "3xBat Betting Platform",
      siteUrl: "https://3xbat.com",
      adminEmail: "admin@3xbat.com",
      maxBetAmount: 10000,
      minBetAmount: 10,
      commissionRate: 5.0,
      maintenanceMode: false,
      allowRegistration: true,
      allowDeposits: true,
      allowWithdrawals: true
    });
    setMessage(null);
  };

  return (
    <Layout>
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              System Settings
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px 20px',
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#059669' : '#dc2626',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                margin: '20px',
                borderRadius: '6px'
              }}>
                {message.text}
              </div>
            )}

            {/* Settings Form */}
            <div style={{ padding: '20px' }}>
              {/* General Settings */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#374151'
                }}>
                  General Settings
                </h3>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '4px', 
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
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
                      Site URL
                    </label>
                    <input
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) => handleInputChange('siteUrl', e.target.value)}
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
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => handleInputChange('adminEmail', e.target.value)}
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
              </div>

              {/* Betting Settings */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#374151'
                }}>
                  Betting Settings
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '4px', 
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Min Bet Amount
                    </label>
                    <input
                      type="number"
                      value={settings.minBetAmount}
                      onChange={(e) => handleInputChange('minBetAmount', Number(e.target.value))}
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
                      Max Bet Amount
                    </label>
                    <input
                      type="number"
                      value={settings.maxBetAmount}
                      onChange={(e) => handleInputChange('maxBetAmount', Number(e.target.value))}
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
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.commissionRate}
                      onChange={(e) => handleInputChange('commissionRate', Number(e.target.value))}
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
              </div>

              {/* System Settings */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#374151'
                }}>
                  System Settings
                </h3>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Maintenance Mode
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Allow User Registration
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={settings.allowDeposits}
                      onChange={(e) => handleInputChange('allowDeposits', e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Allow Deposits
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={settings.allowWithdrawals}
                      onChange={(e) => handleInputChange('allowWithdrawals', e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label style={{ fontWeight: '500', color: '#374151' }}>
                      Allow Withdrawals
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
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

export default Settings;
