# 3xbat Kubernetes Deployment Script for Windows PowerShell
param(
    [switch]$WithMonitoring,
    [string]$RegistryUrl = "your-registry.com",
    [string]$ImageTag = "latest"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

$Namespace = "3xbat"

Write-Host "🚀 Starting 3xbat Kubernetes Deployment" -ForegroundColor $Green

# Function to check if kubectl is available
function Test-Kubectl {
    try {
        kubectl version --client | Out-Null
        Write-Host "✅ kubectl is available" -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "❌ kubectl is not installed or not in PATH" -ForegroundColor $Red
        return $false
    }
}

# Function to check if cluster is accessible
function Test-Cluster {
    try {
        kubectl cluster-info | Out-Null
        Write-Host "✅ Kubernetes cluster is accessible" -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "❌ Cannot connect to Kubernetes cluster" -ForegroundColor $Red
        return $false
    }
}

# Function to create namespace if it doesn't exist
function New-Namespace {
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Namespace $Namespace already exists" -ForegroundColor $Yellow
    }
    else {
        Write-Host "📦 Creating namespace $Namespace" -ForegroundColor $Green
        kubectl apply -f namespace.yaml
    }
}

# Function to deploy infrastructure
function Deploy-Infrastructure {
    Write-Host "🏗️  Deploying infrastructure services..." -ForegroundColor $Green
    
    kubectl apply -f configmaps.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f redis.yaml
    kubectl apply -f postgres.yaml
    
    Write-Host "⏳ Waiting for databases to be ready..." -ForegroundColor $Yellow
    kubectl wait --for=condition=ready pod -l app=redis -n $Namespace --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres -n $Namespace --timeout=300s
    
    Write-Host "✅ Infrastructure services are ready" -ForegroundColor $Green
}

# Function to deploy applications
function Deploy-Applications {
    Write-Host "🚀 Deploying applications..." -ForegroundColor $Green
    
    # Update image references if registry URL is provided
    if ($RegistryUrl -ne "your-registry.com") {
        Write-Host "🔄 Updating image references to $RegistryUrl" -ForegroundColor $Yellow
        
        # Create temporary files with updated image references
        $backendContent = Get-Content backend.yaml -Raw
        $backendContent = $backendContent -replace "3xbat-backend:latest", "$RegistryUrl/3xbat-backend:$ImageTag"
        $backendContent | Set-Content backend-temp.yaml
        
        $frontendContent = Get-Content frontend.yaml -Raw
        $frontendContent = $frontendContent -replace "3xbat-client-panels:latest", "$RegistryUrl/3xbat-client-panels:$ImageTag"
        $frontendContent = $frontendContent -replace "3xbat-control-panel:latest", "$RegistryUrl/3xbat-control-panel:$ImageTag"
        $frontendContent = $frontendContent -replace "3xbat-user-panel:latest", "$RegistryUrl/3xbat-user-panel:$ImageTag"
        $frontendContent | Set-Content frontend-temp.yaml
        
        kubectl apply -f backend-temp.yaml
        kubectl apply -f frontend-temp.yaml
        
        # Clean up temporary files
        Remove-Item backend-temp.yaml -ErrorAction SilentlyContinue
        Remove-Item frontend-temp.yaml -ErrorAction SilentlyContinue
    }
    else {
        kubectl apply -f backend.yaml
        kubectl apply -f frontend.yaml
    }
    
    Write-Host "✅ Applications deployed" -ForegroundColor $Green
}

# Function to deploy ingress
function Deploy-Ingress {
    Write-Host "🌐 Deploying ingress..." -ForegroundColor $Green
    kubectl apply -f ingress.yaml
    Write-Host "✅ Ingress deployed" -ForegroundColor $Green
}

# Function to deploy monitoring
function Deploy-Monitoring {
    if ($WithMonitoring) {
        Write-Host "📊 Deploying monitoring..." -ForegroundColor $Green
        kubectl apply -f monitoring.yaml
        Write-Host "✅ Monitoring deployed" -ForegroundColor $Green
    }
}

# Function to show deployment status
function Show-Status {
    Write-Host "📋 Deployment Status:" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Pods:" -ForegroundColor $Yellow
    kubectl get pods -n $Namespace
    Write-Host ""
    Write-Host "Services:" -ForegroundColor $Yellow
    kubectl get services -n $Namespace
    Write-Host ""
    Write-Host "Ingress:" -ForegroundColor $Yellow
    kubectl get ingress -n $Namespace
    Write-Host ""
    Write-Host "HorizontalPodAutoscaler:" -ForegroundColor $Yellow
    kubectl get hpa -n $Namespace
}

# Function to show useful commands
function Show-Commands {
    Write-Host "🔧 Useful Commands:" -ForegroundColor $Green
    Write-Host ""
    Write-Host "View logs:"
    Write-Host "  kubectl logs -f deployment/backend -n $Namespace"
    Write-Host "  kubectl logs -f deployment/client-panels -n $Namespace"
    Write-Host ""
    Write-Host "Port forward for local testing:"
    Write-Host "  kubectl port-forward service/backend-service 3000:3000 -n $Namespace"
    Write-Host "  kubectl port-forward service/client-panels-service 4000:3000 -n $Namespace"
    Write-Host ""
    Write-Host "Scale deployment:"
    Write-Host "  kubectl scale deployment backend --replicas=5 -n $Namespace"
    Write-Host ""
    Write-Host "Update image:"
    Write-Host "  kubectl set image deployment/backend backend=$RegistryUrl/3xbat-backend:v2.0 -n $Namespace"
    Write-Host ""
    Write-Host "Rollback deployment:"
    Write-Host "  kubectl rollout undo deployment/backend -n $Namespace"
}

# Main deployment flow
function Main {
    if (-not (Test-Kubectl)) { exit 1 }
    if (-not (Test-Cluster)) { exit 1 }
    
    New-Namespace
    Deploy-Infrastructure
    Deploy-Applications
    Deploy-Ingress
    Deploy-Monitoring
    Show-Status
    Show-Commands
    
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green
    Write-Host "💡 Don't forget to update your DNS records to point to your cluster's ingress IP" -ForegroundColor $Yellow
}

# Show help if requested
if ($args -contains "--help" -or $args -contains "-h") {
    Write-Host "Usage: .\deploy.ps1 [-WithMonitoring] [-RegistryUrl <url>] [-ImageTag <tag>]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -WithMonitoring    Deploy monitoring stack (Prometheus/Grafana)"
    Write-Host "  -RegistryUrl       Docker registry URL (default: your-registry.com)"
    Write-Host "  -ImageTag          Image tag to deploy (default: latest)"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1                                    # Basic deployment"
    Write-Host "  .\deploy.ps1 -WithMonitoring                   # With monitoring"
    Write-Host "  .\deploy.ps1 -RegistryUrl myregistry.com       # Custom registry"
    Write-Host "  .\deploy.ps1 -ImageTag v1.2.3                 # Specific version"
    exit 0
}

# Run main deployment
Main
