#!/bin/bash

# 3xbat Kubernetes Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="3xbat"
REGISTRY_URL="${REGISTRY_URL:-your-registry.com}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo -e "${GREEN}🚀 Starting 3xbat Kubernetes Deployment${NC}"

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ kubectl is available${NC}"
}

# Function to check if cluster is accessible
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Kubernetes cluster is accessible${NC}"
}

# Function to create namespace if it doesn't exist
create_namespace() {
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        echo -e "${YELLOW}⚠️  Namespace $NAMESPACE already exists${NC}"
    else
        echo -e "${GREEN}📦 Creating namespace $NAMESPACE${NC}"
        kubectl apply -f namespace.yaml
    fi
}

# Function to deploy infrastructure
deploy_infrastructure() {
    echo -e "${GREEN}🏗️  Deploying infrastructure services...${NC}"
    
    kubectl apply -f configmaps.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f redis.yaml
    kubectl apply -f postgres.yaml
    
    echo -e "${YELLOW}⏳ Waiting for databases to be ready...${NC}"
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✅ Infrastructure services are ready${NC}"
}

# Function to deploy applications
deploy_applications() {
    echo -e "${GREEN}🚀 Deploying applications...${NC}"
    
    # Update image references if registry URL is provided
    if [ "$REGISTRY_URL" != "your-registry.com" ]; then
        echo -e "${YELLOW}🔄 Updating image references to $REGISTRY_URL${NC}"
        sed -i.bak "s|3xbat-backend:latest|$REGISTRY_URL/3xbat-backend:$IMAGE_TAG|g" backend.yaml
        sed -i.bak "s|3xbat-client-panels:latest|$REGISTRY_URL/3xbat-client-panels:$IMAGE_TAG|g" frontend.yaml
        sed -i.bak "s|3xbat-control-panel:latest|$REGISTRY_URL/3xbat-control-panel:$IMAGE_TAG|g" frontend.yaml
        sed -i.bak "s|3xbat-user-panel:latest|$REGISTRY_URL/3xbat-user-panel:$IMAGE_TAG|g" frontend.yaml
    fi
    
    kubectl apply -f backend.yaml
    kubectl apply -f frontend.yaml
    
    echo -e "${GREEN}✅ Applications deployed${NC}"
}

# Function to deploy ingress
deploy_ingress() {
    echo -e "${GREEN}🌐 Deploying ingress...${NC}"
    kubectl apply -f ingress.yaml
    echo -e "${GREEN}✅ Ingress deployed${NC}"
}

# Function to deploy monitoring
deploy_monitoring() {
    if [ "$1" = "--with-monitoring" ]; then
        echo -e "${GREEN}📊 Deploying monitoring...${NC}"
        kubectl apply -f monitoring.yaml
        echo -e "${GREEN}✅ Monitoring deployed${NC}"
    fi
}

# Function to show deployment status
show_status() {
    echo -e "${GREEN}📋 Deployment Status:${NC}"
    echo ""
    echo -e "${YELLOW}Pods:${NC}"
    kubectl get pods -n $NAMESPACE
    echo ""
    echo -e "${YELLOW}Services:${NC}"
    kubectl get services -n $NAMESPACE
    echo ""
    echo -e "${YELLOW}Ingress:${NC}"
    kubectl get ingress -n $NAMESPACE
    echo ""
    echo -e "${YELLOW}HorizontalPodAutoscaler:${NC}"
    kubectl get hpa -n $NAMESPACE
}

# Function to show useful commands
show_commands() {
    echo -e "${GREEN}🔧 Useful Commands:${NC}"
    echo ""
    echo "View logs:"
    echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
    echo "  kubectl logs -f deployment/client-panels -n $NAMESPACE"
    echo ""
    echo "Port forward for local testing:"
    echo "  kubectl port-forward service/backend-service 3000:3000 -n $NAMESPACE"
    echo "  kubectl port-forward service/client-panels-service 4000:3000 -n $NAMESPACE"
    echo ""
    echo "Scale deployment:"
    echo "  kubectl scale deployment backend --replicas=5 -n $NAMESPACE"
    echo ""
    echo "Update image:"
    echo "  kubectl set image deployment/backend backend=$REGISTRY_URL/3xbat-backend:v2.0 -n $NAMESPACE"
    echo ""
    echo "Rollback deployment:"
    echo "  kubectl rollout undo deployment/backend -n $NAMESPACE"
}

# Main deployment flow
main() {
    check_kubectl
    check_cluster
    create_namespace
    deploy_infrastructure
    deploy_applications
    deploy_ingress
    deploy_monitoring "$@"
    show_status
    show_commands
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${YELLOW}💡 Don't forget to update your DNS records to point to your cluster's ingress IP${NC}"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [--with-monitoring]"
        echo ""
        echo "Options:"
        echo "  --with-monitoring    Deploy monitoring stack (Prometheus/Grafana)"
        echo ""
        echo "Environment Variables:"
        echo "  REGISTRY_URL        Docker registry URL (default: your-registry.com)"
        echo "  IMAGE_TAG           Image tag to deploy (default: latest)"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Basic deployment"
        echo "  $0 --with-monitoring                  # With monitoring"
        echo "  REGISTRY_URL=myregistry.com $0        # Custom registry"
        echo "  IMAGE_TAG=v1.2.3 $0                  # Specific version"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
