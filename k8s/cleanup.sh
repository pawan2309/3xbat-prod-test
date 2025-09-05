#!/bin/bash

# 3xbat Kubernetes Cleanup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE="3xbat"

echo -e "${RED}🧹 Starting 3xbat Kubernetes Cleanup${NC}"

# Function to confirm deletion
confirm_deletion() {
    echo -e "${YELLOW}⚠️  This will delete ALL resources in the $NAMESPACE namespace${NC}"
    echo -e "${YELLOW}⚠️  This includes databases and persistent volumes!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${GREEN}✅ Cleanup cancelled${NC}"
        exit 0
    fi
}

# Function to delete all resources
cleanup_resources() {
    echo -e "${RED}🗑️  Deleting all resources in namespace $NAMESPACE...${NC}"
    
    # Delete deployments
    kubectl delete deployment --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete services
    kubectl delete service --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete ingress
    kubectl delete ingress --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete configmaps
    kubectl delete configmap --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete secrets
    kubectl delete secret --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete PVCs (this will delete persistent data!)
    kubectl delete pvc --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete HPA
    kubectl delete hpa --all -n $NAMESPACE --ignore-not-found=true
    
    # Delete ServiceMonitor (if monitoring was deployed)
    kubectl delete servicemonitor --all -n $NAMESPACE --ignore-not-found=true
    
    echo -e "${GREEN}✅ All resources deleted${NC}"
}

# Function to delete namespace
delete_namespace() {
    echo -e "${RED}🗑️  Deleting namespace $NAMESPACE...${NC}"
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    echo -e "${GREEN}✅ Namespace deleted${NC}"
}

# Function to show remaining resources
show_remaining() {
    echo -e "${YELLOW}📋 Checking for remaining resources...${NC}"
    
    # Check if namespace still exists
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        echo -e "${YELLOW}⚠️  Namespace $NAMESPACE still exists${NC}"
        kubectl get all -n $NAMESPACE
    else
        echo -e "${GREEN}✅ Namespace $NAMESPACE has been completely removed${NC}"
    fi
}

# Main cleanup flow
main() {
    if [ "$1" = "--force" ]; then
        echo -e "${YELLOW}⚠️  Force mode enabled - skipping confirmation${NC}"
    else
        confirm_deletion
    fi
    
    cleanup_resources
    delete_namespace
    show_remaining
    
    echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
    echo -e "${YELLOW}💡 All data has been permanently deleted${NC}"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [--force]"
        echo ""
        echo "Options:"
        echo "  --force    Skip confirmation prompt"
        echo ""
        echo "This script will:"
        echo "  - Delete all deployments, services, and ingress"
        echo "  - Delete all configmaps and secrets"
        echo "  - Delete all persistent volume claims (DATA LOSS!)"
        echo "  - Delete the entire namespace"
        echo ""
        echo "WARNING: This will permanently delete all data!"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
