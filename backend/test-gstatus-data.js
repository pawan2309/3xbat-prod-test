const http = require('http');

console.log('🔍 Testing Fixtures and Odds endpoints for gstatus data...\n');

// Test Fixtures
console.log('=== FIXTURES ENDPOINT ===');
const fixturesOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/cricket/fixtures',
  method: 'GET'
};

const fixturesReq = http.request(fixturesOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Fixtures Response:');
      console.log('Total matches:', response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        console.log('Sample match structure:');
        console.log(JSON.stringify(response.data[0], null, 2));
      }
    } catch (e) {
      console.log('❌ Fixtures Error:', e.message);
    }
    
    // Test Odds after fixtures
    testOdds();
  });
});

fixturesReq.on('error', (e) => {
  console.log('❌ Fixtures Request error:', e.message);
  testOdds();
});

fixturesReq.end();

// Test Odds
function testOdds() {
  console.log('\n=== ODDS ENDPOINT ===');
  const oddsOptions = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/cricket/odds?eventId=34701084',
    method: 'GET'
  };

  const oddsReq = http.request(oddsOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Odds Response:');
        console.log('Success:', response.success);
        console.log('Data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Total markets:', response.data.length);
          
          // Look for gstatus in the data
          console.log('\n🔍 Searching for gstatus field...');
          let foundGstatus = false;
          
          response.data.forEach((market, marketIndex) => {
            if (market.gstatus) {
              console.log(`✅ Found gstatus in market ${marketIndex}:`, market.gstatus);
              foundGstatus = true;
            }
            
            if (market.section && Array.isArray(market.section)) {
              market.section.forEach((section, sectionIndex) => {
                if (section.gstatus) {
                  console.log(`✅ Found gstatus in section ${marketIndex}-${sectionIndex}:`, section.gstatus);
                  foundGstatus = true;
                }
                
                if (section.odds && Array.isArray(section.odds)) {
                  section.odds.forEach((odd, oddIndex) => {
                    if (odd.gstatus) {
                      console.log(`✅ Found gstatus in odd ${marketIndex}-${sectionIndex}-${oddIndex}:`, odd.gstatus);
                      foundGstatus = true;
                    }
                  });
                }
              });
            }
          });
          
          if (!foundGstatus) {
            console.log('❌ No gstatus field found in odds data');
            console.log('Sample market structure:');
            if (response.data[0]) {
              console.log(JSON.stringify(response.data[0], null, 2));
            }
          }
        }
      } catch (e) {
        console.log('❌ Odds Error:', e.message);
      }
    });
  });

  oddsReq.on('error', (e) => {
    console.log('❌ Odds Request error:', e.message);
  });

  oddsReq.end();
}
