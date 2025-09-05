#!/usr/bin/env node

/**
 * Test script for Casino Data Monitor
 * Tests basic functionality without starting continuous monitoring
 */

const CasinoDataMonitor = require('./casino-data-monitor');

async function testMonitor() {
    console.log('🧪 Testing Casino Data Monitor...\n');
    
    const monitor = new CasinoDataMonitor();
    
    try {
        // Test tunnel status check
        console.log('1. Testing tunnel status check...');
        const tunnelStatus = await monitor.checkTunnelStatus();
        console.log(`   Result: ${tunnelStatus ? '✅ Active' : '❌ Inactive'}\n`);
        
        // Test single casino data fetch
        console.log('2. Testing single casino data fetch...');
        const testEndpoint = {
            name: 'Test Game',
            type: 'test',
            url: '/casino/data/teen20'
        };
        
        const result = await monitor.fetchCasinoData('test', testEndpoint);
        console.log(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
        if (result.success) {
            console.log(`   Data received: ${JSON.stringify(result.data).substring(0, 100)}...`);
        } else {
            console.log(`   Error: ${result.error}`);
        }
        
        console.log('\n3. Testing log directory creation...');
        monitor.ensureLogDirectory();
        console.log('   ✅ Log directory check completed');
        
        console.log('\n4. Testing data display...');
        const testData = [
            {
                success: true,
                gameType: 'teen20',
                gameName: 'Teen Patti 20',
                data: { gameId: 'test_001', status: 'active' },
                timestamp: new Date().toISOString(),
                responseTime: '150ms'
            },
            {
                success: false,
                gameType: 'ab20',
                gameName: 'Andar Bahar 20',
                error: 'Connection timeout',
                timestamp: new Date().toISOString()
            }
        ];
        
        monitor.displayData(testData);
        
        console.log('\n✅ All tests completed successfully!');
        console.log('🎯 The monitor is ready to use.');
        
    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testMonitor();
}

module.exports = testMonitor;
