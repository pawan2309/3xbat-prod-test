# Test All Casino API Endpoints
# This script tests all available casino API endpoints and displays their responses

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TESTING ALL CASINO API ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$endpoints = @(
    @{ name = "Teen Patti 20 Live Data"; path = "/casino/data/teen20" },
    @{ name = "Andar Bahar 20 Live Data"; path = "/casino/data/ab20" },
    @{ name = "Dragon Tiger 20 Live Data"; path = "/casino/data/dt20" },
    @{ name = "AAA Live Data"; path = "/casino/data/aaa" },
    @{ name = "Card 32 EU Live Data"; path = "/casino/data/card32eu" },
    @{ name = "Lucky 7 EU Live Data"; path = "/casino/data/lucky7eu" },
    @{ name = "Teen Patti 20 Results"; path = "/casino/results/teen20" },
    @{ name = "Andar Bahar 20 Results"; path = "/casino/results/ab20" },
    @{ name = "Dragon Tiger 20 Results"; path = "/casino/results/dt20" },
    @{ name = "AAA Results"; path = "/casino/results/aaa" },
    @{ name = "Card 32 EU Results"; path = "/casino/results/card32eu" },
    @{ name = "Lucky 7 EU Results"; path = "/casino/results/lucky7eu" },
    @{ name = "All Casino Data"; path = "/casino/data" },
    @{ name = "TV Streaming"; path = "/casino/tv" }
)

$successCount = 0
$totalCount = $endpoints.Count

foreach ($endpoint in $endpoints) {
    $url = $baseUrl + $endpoint.path
    Write-Host "🔍 Testing: $($endpoint.name)" -ForegroundColor Blue
    Write-Host "   URL: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "   📊 Response Length: $($response.Content.Length) characters" -ForegroundColor Cyan
            
            # Try to parse as JSON and show structure
            try {
                $jsonData = $response.Content | ConvertFrom-Json -ErrorAction Stop
                Write-Host "   🎯 JSON Structure:" -ForegroundColor Magenta
                
                if ($jsonData.PSObject.Properties.Name) {
                    $jsonData.PSObject.Properties.Name | ForEach-Object {
                        Write-Host "      - $_" -ForegroundColor White
                    }
                }
                
                # Show sample data for live game endpoints
                if ($endpoint.path -like "*/data/*" -and $jsonData.data) {
                    Write-Host "   🎮 Game Data Sample:" -ForegroundColor Green
                    if ($jsonData.data.t1) {
                        Write-Host "      t1 (Game Info): $($jsonData.data.t1.Count) items" -ForegroundColor White
                    }
                    if ($jsonData.data.t2) {
                        Write-Host "      t2 (Betting): $($jsonData.data.t2.Count) items" -ForegroundColor White
                    }
                }
                
            } catch {
                Write-Host "   ⚠️  Not valid JSON" -ForegroundColor Yellow
            }
            
            $successCount++
        } else {
            Write-Host "   ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500  # Small delay between requests
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TESTING COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $($totalCount - $successCount)" -ForegroundColor Red
Write-Host "📊 Success Rate: $([math]::Round(($successCount / $totalCount) * 100, 2))%" -ForegroundColor Cyan
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "🎉 All casino API endpoints are working!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some endpoints failed. Check SSH tunnel and external API status." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
