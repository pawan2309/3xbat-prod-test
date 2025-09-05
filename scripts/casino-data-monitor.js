#!/usr/bin/env node

/**
 * Casino Data Monitor - Teen Patti 20 Only
 * Monitors Teen Patti 20 data flowing through SSH tunnel to backend API
 * Displays real-time data and saves to log files with proper API URL headers
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration - Teen Patti 20 Only
const CONFIG = {
    // SSH Tunnel endpoints
    localTunnelPort: 8000,  // Local port for external_apis tunnel
    remoteProxyPort: 17300, // Remote AWS proxy port
    
    // Teen Patti 20 API endpoint only
    casinoEndpoints: [
        { 
            name: 'Teen Patti 20', 
            type: 'teen20', 
            url: '/casino/data/teen20',
            fullUrl: 'http://localhost:8000/casino/data/teen20',
            description: 'Teen Patti 20 Live Game Data'
        }
    ],
    
    // Monitoring settings
    checkInterval: 5000, // 5 seconds for faster updates
    maxRetries: 3,
    timeout: 10000,
    
    // Logging
    logDir: './logs',
    dataLogFile: 'teen20-data.log',
    errorLogFile: 'teen20-errors.log',
    summaryLogFile: 'teen20-summary.log'
};

// Colors for console output
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

class TeenPatti20Monitor {
    constructor() {
        this.isRunning = false;
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            lastCheck: null,
            startTime: new Date()
        };
        this.dataCache = new Map();
        
        this.ensureLogDirectory();
        this.setupConsoleInterface();
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDirectory() {
        if (!fs.existsSync(CONFIG.logDir)) {
            fs.mkdirSync(CONFIG.logDir, { recursive: true });
            console.log(`${COLORS.green}✅ Created log directory: ${CONFIG.logDir}${COLORS.reset}`);
        }
    }

    /**
     * Setup console interface with readline
     */
    setupConsoleInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Handle process termination
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }

    /**
     * Log message to console and file
     */
    log(message, level = 'INFO', saveToFile = true) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        
        // Console output with colors
        switch (level) {
            case 'ERROR':
                console.log(`${COLORS.red}${formattedMessage}${COLORS.reset}`);
                break;
            case 'WARN':
                console.log(`${COLORS.yellow}${formattedMessage}${COLORS.reset}`);
                break;
            case 'SUCCESS':
                console.log(`${COLORS.green}${formattedMessage}${COLORS.reset}`);
                break;
            case 'INFO':
            default:
                console.log(`${COLORS.blue}${formattedMessage}${COLORS.reset}`);
        }

        // Save to appropriate log file
        if (saveToFile) {
            const logFile = level === 'ERROR' ? CONFIG.errorLogFile : CONFIG.dataLogFile;
            const logPath = path.join(CONFIG.logDir, logFile);
            
            try {
                fs.appendFileSync(logPath, formattedMessage + '\n');
            } catch (error) {
                console.error(`${COLORS.red}Failed to write to log file: ${error.message}${COLORS.reset}`);
            }
        }
    }

    /**
     * Check if SSH tunnel is active
     */
    async checkTunnelStatus() {
        try {
            const response = await axios.get(`http://localhost:${CONFIG.localTunnelPort}/health`, {
                timeout: 5000
            });
            
            if (response.data.status === 'OK') {
                this.log('✅ SSH tunnel is active and proxy is responding', 'SUCCESS');
                return true;
            }
        } catch (error) {
            this.log(`❌ SSH tunnel check failed: ${error.message}`, 'ERROR');
            return false;
        }
        return false;
    }

    /**
     * Fetch Teen Patti 20 data
     */
    async fetchTeenPatti20Data() {
        const endpoint = CONFIG.casinoEndpoints[0];
        
        try {
            this.log(`🔍 Fetching Teen Patti 20 data from: ${endpoint.fullUrl}`, 'INFO');
            
            const response = await axios.get(endpoint.fullUrl, {
                timeout: CONFIG.timeout,
                headers: {
                    'User-Agent': 'TeenPatti20Monitor/1.0',
                    'Accept': 'application/json'
                }
            });

            if (response.data) {
                this.log(`✅ Successfully fetched Teen Patti 20 data`, 'SUCCESS');
                return {
                    success: true,
                    gameType: endpoint.type,
                    gameName: endpoint.name,
                    apiUrl: endpoint.fullUrl,
                    data: response.data,
                    timestamp: new Date().toISOString(),
                    responseTime: response.headers['x-response-time'] || 'N/A',
                    httpStatus: response.status
                };
            } else {
                this.log(`⚠️  No data received for Teen Patti 20`, 'WARN');
                return {
                    success: false,
                    gameType: endpoint.type,
                    gameName: endpoint.name,
                    apiUrl: endpoint.fullUrl,
                    error: 'No data received',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            this.log(`❌ Failed to fetch Teen Patti 20 data: ${error.message}`, 'ERROR');
            return {
                success: false,
                gameType: endpoint.type,
                gameName: endpoint.name,
                apiUrl: endpoint.fullUrl,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Save data to summary log with proper headers
     */
    saveDataSummary(data) {
        try {
            const summaryPath = path.join(CONFIG.logDir, CONFIG.summaryLogFile);
            
            // Create detailed summary with API information
            const summary = {
                // API Information Header
                apiInfo: {
                    name: 'Teen Patti 20 Casino Data Monitor',
                    description: 'Monitors live Teen Patti 20 game data from external casino API',
                    baseUrl: `http://localhost:${CONFIG.localTunnelPort}`,
                    endpoint: '/casino/data/teen20',
                    fullUrl: `http://localhost:${CONFIG.localTunnelPort}/casino/data/teen20`,
                    sshTunnel: {
                        localPort: CONFIG.localTunnelPort,
                        remotePort: CONFIG.remoteProxyPort,
                        status: 'Active'
                    },
                    monitoring: {
                        interval: `${CONFIG.checkInterval/1000} seconds`,
                        timeout: `${CONFIG.timeout/1000} seconds`
                    }
                },
                
                // Data Summary
                dataSummary: {
                    timestamp: new Date().toISOString(),
                    tunnelStatus: 'Active',
                    dataReceived: data.success ? 1 : 0,
                    totalEndpoints: 1,
                    httpStatus: data.httpStatus || 'N/A',
                    responseTime: data.responseTime || 'N/A'
                },
                
                // Raw Data
                rawData: data
            };

            // Add separator for readability
            const logEntry = JSON.stringify(summary, null, 2) + '\n' + '='.repeat(80) + '\n';
            fs.appendFileSync(summaryPath, logEntry);
            
            this.log(`💾 Data summary saved to: ${summaryPath}`, 'SUCCESS');
        } catch (error) {
            this.log(`Failed to save summary: ${error.message}`, 'ERROR');
        }
    }

    /**
     * Display Teen Patti 20 data in a formatted way with API headers
     */
    displayData(data) {
        console.log('\n' + '='.repeat(100));
        console.log(`${COLORS.bright}🎰 TEEN PATTI 20 CASINO DATA MONITOR${COLORS.reset}`);
        console.log('='.repeat(100));
        
        // API Information Header
        console.log(`${COLORS.cyan}📡 API INFORMATION:${COLORS.reset}`);
        console.log(`${COLORS.white}   Base URL: ${COLORS.yellow}http://localhost:${CONFIG.localTunnelPort}${COLORS.reset}`);
        console.log(`${COLORS.white}   Endpoint: ${COLORS.yellow}/casino/data/teen20${COLORS.reset}`);
        console.log(`${COLORS.white}   Full URL: ${COLORS.yellow}${data.apiUrl}${COLORS.reset}`);
        console.log(`${COLORS.white}   SSH Tunnel: ${COLORS.green}Local Port ${CONFIG.localTunnelPort} → Remote Port ${CONFIG.remoteProxyPort}${COLORS.reset}`);
        console.log(`${COLORS.white}   Monitoring: ${COLORS.cyan}Every ${CONFIG.checkInterval/1000} seconds${COLORS.reset}`);

        // Data Status
        console.log(`\n${COLORS.cyan}📊 DATA STATUS:${COLORS.reset}`);
        if (data.success) {
            console.log(`${COLORS.green}✅ SUCCESS: Teen Patti 20 data received${COLORS.reset}`);
            console.log(`${COLORS.white}   HTTP Status: ${COLORS.green}${data.httpStatus}${COLORS.reset}`);
            console.log(`${COLORS.white}   Response Time: ${COLORS.green}${data.responseTime}${COLORS.reset}`);
            console.log(`${COLORS.white}   Timestamp: ${COLORS.green}${data.timestamp}${COLORS.reset}`);
        } else {
            console.log(`${COLORS.red}❌ FAILED: Teen Patti 20 data fetch failed${COLORS.reset}`);
            console.log(`${COLORS.white}   Error: ${COLORS.red}${data.error}${COLORS.reset}`);
            console.log(`${COLORS.white}   Timestamp: ${COLORS.red}${data.timestamp}${COLORS.reset}`);
        }

        // Display Teen Patti 20 specific data
        if (data.success && data.data) {
            console.log(`\n${COLORS.cyan}🎮 TEEN PATTI 20 GAME DATA:${COLORS.reset}`);
            
            // Check if data has the expected structure
            if (data.data.data && data.data.data.t1 && data.data.data.t2) {
                const gameData = data.data.data.t1[0];
                const bettingData = data.data.data.t2;
                
                if (gameData) {
                    console.log(`${COLORS.white}   Round ID: ${COLORS.green}${gameData.mid || 'N/A'}${COLORS.reset}`);
                    console.log(`${COLORS.white}   Timer: ${COLORS.yellow}${gameData.autotime || 'N/A'} seconds${COLORS.reset}`);
                    console.log(`${COLORS.white}   Game Type: ${COLORS.cyan}${gameData.gtype || 'N/A'}${COLORS.reset}`);
                    console.log(`${COLORS.white}   Min Bet: ${COLORS.green}${gameData.min || 'N/A'}${COLORS.reset}`);
                    console.log(`${COLORS.white}   Max Bet: ${COLORS.green}${gameData.max || 'N/A'}${COLORS.reset}`);
                    
                    // Display cards
                    console.log(`${COLORS.white}   Player A Cards: ${COLORS.magenta}${gameData.C1 || 'N/A'}, ${gameData.C2 || 'N/A'}, ${gameData.C3 || 'N/A'}${COLORS.reset}`);
                    console.log(`${COLORS.white}   Player B Cards: ${COLORS.magenta}${gameData.C4 || 'N/A'}, ${gameData.C5 || 'N/A'}, ${gameData.C6 || 'N/A'}${COLORS.reset}`);
                }
                
                if (bettingData && bettingData.length > 0) {
                    console.log(`\n${COLORS.white}   Betting Options:${COLORS.reset}`);
                    bettingData.forEach((bet, index) => {
                        const statusColor = bet.gstatus === '1' ? COLORS.green : COLORS.red;
                        const statusText = bet.gstatus === '1' ? 'ACTIVE' : 'INACTIVE';
                        console.log(`${COLORS.white}     ${index + 1}. ${bet.nation}: ${COLORS.yellow}Rate ${bet.rate}${COLORS.reset} (${statusColor}${statusText}${COLORS.reset}) - Min: ${bet.min}, Max: ${bet.max}`);
                    });
                }
            } else {
                console.log(`${COLORS.yellow}⚠️  Data structure not as expected. Raw data:${COLORS.reset}`);
                console.log(JSON.stringify(data.data, null, 2));
            }
        }

        // Statistics
        console.log(`\n${COLORS.cyan}📈 MONITORING STATISTICS:${COLORS.reset}`);
        console.log(`${COLORS.white}   Total Checks: ${COLORS.cyan}${this.stats.totalChecks}${COLORS.reset}`);
        console.log(`${COLORS.white}   Success Rate: ${COLORS.cyan}${((this.stats.successfulChecks / this.stats.totalChecks) * 100).toFixed(2)}%${COLORS.reset}`);
        console.log(`${COLORS.white}   Running Since: ${COLORS.cyan}${this.stats.startTime.toLocaleString()}${COLORS.reset}`);
        console.log(`${COLORS.white}   Last Check: ${COLORS.cyan}${this.stats.lastCheck ? this.stats.lastCheck.toLocaleString() : 'Never'}${COLORS.reset}`);

        console.log('\n' + '='.repeat(100) + '\n');
    }

    /**
     * Perform one complete monitoring cycle
     */
    async performCheck() {
        this.stats.totalChecks++;
        this.stats.lastCheck = new Date();

        this.log(`🔄 Starting Teen Patti 20 monitoring cycle #${this.stats.totalChecks}`, 'INFO');

        // Check tunnel status first
        const tunnelActive = await this.checkTunnelStatus();
        if (!tunnelActive) {
            this.log('❌ SSH tunnel is not active. Skipping data fetch.', 'ERROR');
            this.stats.failedChecks++;
            return;
        }

        // Fetch Teen Patti 20 data
        const result = await this.fetchTeenPatti20Data();
        
        if (result.success) {
            this.stats.successfulChecks++;
        } else {
            this.stats.failedChecks++;
        }

        // Display and save results
        this.displayData(result);
        this.saveDataSummary(result);

        this.log(`✅ Teen Patti 20 monitoring cycle #${this.stats.totalChecks} completed`, 'SUCCESS');
    }

    /**
     * Start continuous monitoring
     */
    async start() {
        if (this.isRunning) {
            this.log('⚠️  Monitor is already running', 'WARN');
            return;
        }

        this.isRunning = true;
        console.log('\n' + '='.repeat(100));
        console.log(`${COLORS.bright}🚀 STARTING TEEN PATTI 20 CASINO DATA MONITOR${COLORS.reset}`);
        console.log('='.repeat(100));
        this.log('🎯 Monitoring Teen Patti 20 data only', 'INFO');
        this.log(`📡 SSH tunnel: localhost:${CONFIG.localTunnelPort} → remote:${CONFIG.remoteProxyPort}`, 'INFO');
        this.log(`🔗 API Endpoint: ${CONFIG.casinoEndpoints[0].fullUrl}`, 'INFO');
        this.log(`⏱️  Check interval: ${CONFIG.checkInterval/1000} seconds`, 'INFO');
        this.log(`💾 Logs: ${CONFIG.logDir}`, 'INFO');
        this.log('🛑 Press Ctrl+C to stop monitoring', 'INFO');
        console.log('='.repeat(100) + '\n');

        // Perform initial check
        await this.performCheck();

        // Start continuous monitoring
        this.monitoringInterval = setInterval(async () => {
            if (this.isRunning) {
                await this.performCheck();
            }
        }, CONFIG.checkInterval);
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (!this.isRunning) {
            this.log('⚠️  Monitor is not running', 'WARN');
            return;
        }

        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.log('🛑 Teen Patti 20 Monitor stopped', 'INFO');
        this.displayFinalStats();
    }

    /**
     * Display final statistics
     */
    displayFinalStats() {
        console.log('\n' + '='.repeat(80));
        console.log(`${COLORS.bright}📊 FINAL TEEN PATTI 20 MONITORING STATISTICS${COLORS.reset}`);
        console.log('='.repeat(80));
        console.log(`${COLORS.white}Total Checks: ${COLORS.cyan}${this.stats.totalChecks}${COLORS.reset}`);
        console.log(`${COLORS.white}Successful: ${COLORS.green}${this.stats.successfulChecks}${COLORS.reset}`);
        console.log(`${COLORS.white}Failed: ${COLORS.red}${this.stats.failedChecks}${COLORS.reset}`);
        console.log(`${COLORS.white}Success Rate: ${COLORS.cyan}${((this.stats.successfulChecks / this.stats.totalChecks) * 100).toFixed(2)}%${COLORS.reset}`);
        console.log(`${COLORS.white}Running Time: ${COLORS.cyan}${Math.round((new Date() - this.stats.startTime) / 1000)} seconds${COLORS.reset}`);
        console.log(`${COLORS.white}API Endpoint: ${COLORS.yellow}${CONFIG.casinoEndpoints[0].fullUrl}${COLORS.reset}`);
        console.log('='.repeat(80));
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.log('\n🔄 Shutting down Teen Patti 20 Monitor...', 'INFO');
        this.stop();
        
        if (this.rl) {
            this.rl.close();
        }
        
        process.exit(0);
    }
}

// Main execution
async function main() {
    const monitor = new TeenPatti20Monitor();
    
    try {
        await monitor.start();
    } catch (error) {
        console.error(`${COLORS.red}Fatal error: ${error.message}${COLORS.reset}`);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = TeenPatti20Monitor;
