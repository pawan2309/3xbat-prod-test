# 3xbat Kubernetes Cleanup Script for Windows PowerShell
param(
    [switch]$Force
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

$Namespace = "3xbat"

Write-Host "🧹 Starting 3xbat Kubernetes Cleanup" -ForegroundColor $Red

# Function to confirm deletion
function Confirm-Deletion {
    Write-Host "⚠️  This will delete ALL resources in the $Namespace namespace" -ForegroundColor $Yellow
    Write-Host "⚠️  This includes databases and persistent volumes!" -ForegroundColor $Yellow
    $response = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($response -notmatch "^[Yy][Ee][Ss]$") {
        Write-Host "✅ Cleanup cancelled" -ForegroundColor $Green
        exit 0
    }
}

# Function to delete all resources
function Remove-Resources {
    Write-Host "🗑️  Deleting all resources in namespace $Namespace..." -ForegroundColor $Red
    
    # Delete deployments
    kubectl delete deployment --all -n $Namespace --ignore-not-found=true
    
    # Delete services
    kubectl delete service --all -n $Namespace --ignore-not-found=true
    
    # Delete ingress
    kubectl delete ingress --all -n $Namespace --ignore-not-found=true
    
    # Delete configmaps
    kubectl delete configmap --all -n $Namespace --ignore-not-found=true
    
    # Delete secrets
    kubectl delete secret --all -n $Namespace --ignore-not-found=true
    
    # Delete PVCs (this will delete persistent data!)
    kubectl delete pvc --all -n $Namespace --ignore-not-found=true
    
    # Delete HPA
    kubectl delete hpa --all -n $Namespace --ignore-not-found=true
    
    # Delete ServiceMonitor (if monitoring was deployed)
    kubectl delete servicemonitor --all -n $Namespace --ignore-not-found=true
    
    Write-Host "✅ All resources deleted" -ForegroundColor $Green
}

# Function to delete namespace
function Remove-Namespace {
    Write-Host "🗑️  Deleting namespace $Namespace..." -ForegroundColor $Red
    kubectl delete namespace $Namespace --ignore-not-found=true
    Write-Host "✅ Namespace deleted" -ForegroundColor $Green
}

# Function to show remaining resources
function Show-Remaining {
    Write-Host "📋 Checking for remaining resources..." -ForegroundColor $Yellow
    
    # Check if namespace still exists
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Namespace $Namespace still exists" -ForegroundColor $Yellow
        kubectl get all -n $Namespace
    }
    else {
        Write-Host "✅ Namespace $Namespace has been completely removed" -ForegroundColor $Green
    }
}

# Main cleanup flow
function Main {
    if (-not $Force) {
        Confirm-Deletion
    }
    else {
        Write-Host "⚠️  Force mode enabled - skipping confirmation" -ForegroundColor $Yellow
    }
    
    Remove-Resources
    Remove-Namespace
    Show-Remaining
    
    Write-Host "🎉 Cleanup completed successfully!" -ForegroundColor $Green
    Write-Host "💡 All data has been permanently deleted" -ForegroundColor $Yellow
}

# Show help if requested
if ($args -contains "--help" -or $args -contains "-h") {
    Write-Host "Usage: .\cleanup.ps1 [-Force]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -Force    Skip confirmation prompt"
    Write-Host ""
    Write-Host "This script will:"
    Write-Host "  - Delete all deployments, services, and ingress"
    Write-Host "  - Delete all configmaps and secrets"
    Write-Host "  - Delete all persistent volume claims (DATA LOSS!)"
    Write-Host "  - Delete the entire namespace"
    Write-Host ""
    Write-Host "WARNING: This will permanently delete all data!"
    exit 0
}

# Run main cleanup
Main
