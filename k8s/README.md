# 3xbat Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the 3xbat betting platform.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Panels │    │  Control Panel  │    │   User Panel    │
│   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx Ingress │
                    │   (Load Balancer)│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Backend API    │
                    │  (Node.js)      │
                    │  [Auto-scaling] │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redis       │    │   PostgreSQL    │    │   Monitoring    │
│   (Cache)       │    │   (Database)    │    │ (Prometheus)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

1. **Kubernetes Cluster** (v1.20+)
   - Local: minikube, kind, or Docker Desktop
   - Cloud: EKS, GKE, AKS, or DigitalOcean

2. **Required Tools**
   ```bash
   kubectl
   helm (optional, for easier management)
   docker (for building images)
   ```

3. **Ingress Controller**
   ```bash
   # Install NGINX Ingress Controller
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   
   # Or use Helm
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm install ingress-nginx ingress-nginx/ingress-nginx
   ```

4. **Cert-Manager** (for SSL certificates)
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

## Deployment Steps

### 1. Build Docker Images

```bash
# Build backend image
cd backend
docker build -t 3xbat-backend:latest .

# Build frontend images
cd ../frontend/apps/client-panels
docker build -t 3xbat-client-panels:latest .

cd ../control-panel
docker build -t 3xbat-control-panel:latest .

cd ../user-panel
docker build -t 3xbat-user-panel:latest .
```

### 2. Push Images to Registry

```bash
# Tag for your registry
docker tag 3xbat-backend:latest your-registry.com/3xbat-backend:latest
docker tag 3xbat-client-panels:latest your-registry.com/3xbat-client-panels:latest
docker tag 3xbat-control-panel:latest your-registry.com/3xbat-control-panel:latest
docker tag 3xbat-user-panel:latest your-registry.com/3xbat-user-panel:latest

# Push to registry
docker push your-registry.com/3xbat-backend:latest
docker push your-registry.com/3xbat-client-panels:latest
docker push your-registry.com/3xbat-control-panel:latest
docker push your-registry.com/3xbat-user-panel:latest
```

### 3. Update Image References

Update the image names in the YAML files to point to your registry.

### 4. Deploy to Kubernetes

```bash
# Create namespace and basic resources
kubectl apply -f namespace.yaml
kubectl apply -f configmaps.yaml
kubectl apply -f secrets.yaml

# Deploy infrastructure
kubectl apply -f redis.yaml
kubectl apply -f postgres.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=redis -n 3xbat --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres -n 3xbat --timeout=300s

# Deploy applications
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml

# Deploy ingress
kubectl apply -f ingress.yaml

# Deploy monitoring (optional)
kubectl apply -f monitoring.yaml
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n 3xbat

# Check services
kubectl get services -n 3xbat

# Check ingress
kubectl get ingress -n 3xbat

# View logs
kubectl logs -f deployment/backend -n 3xbat
```

## Configuration

### Environment Variables

Key environment variables are managed through ConfigMaps and Secrets:

- **ConfigMaps**: Non-sensitive configuration
- **Secrets**: Sensitive data (JWT secrets, passwords)

### Scaling

The backend automatically scales based on CPU and memory usage:
- **Min replicas**: 3
- **Max replicas**: 10
- **CPU threshold**: 70%
- **Memory threshold**: 80%

### SSL/TLS

SSL certificates are automatically managed by cert-manager using Let's Encrypt.

## Monitoring

### Metrics

- **Prometheus**: Collects metrics from all services
- **Grafana**: Visualization dashboard
- **ServiceMonitor**: Automatically discovers backend metrics

### Health Checks

All services include:
- **Liveness probes**: Restart unhealthy containers
- **Readiness probes**: Remove from load balancer if not ready
- **Startup probes**: Allow time for application startup

## Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n 3xbat
   kubectl logs <pod-name> -n 3xbat
   ```

2. **Database connection issues**
   ```bash
   kubectl exec -it deployment/postgres -n 3xbat -- psql -U postgres -d betting_db
   ```

3. **Ingress not working**
   ```bash
   kubectl get ingress -n 3xbat
   kubectl describe ingress 3xbat-ingress -n 3xbat
   ```

### Useful Commands

```bash
# Port forward for local testing
kubectl port-forward service/backend-service 3000:3000 -n 3xbat

# Scale deployment
kubectl scale deployment backend --replicas=5 -n 3xbat

# Update image
kubectl set image deployment/backend backend=3xbat-backend:v2.0 -n 3xbat

# Rollback deployment
kubectl rollout undo deployment/backend -n 3xbat
```

## Production Considerations

1. **Resource Limits**: Adjust CPU/memory limits based on your needs
2. **Storage**: Use appropriate storage classes for your cloud provider
3. **Security**: Implement network policies and RBAC
4. **Backup**: Set up database backups and disaster recovery
5. **Monitoring**: Implement comprehensive logging and alerting
6. **CI/CD**: Automate deployments with GitHub Actions or similar

## Cost Optimization

1. **Node pools**: Use spot instances for non-critical workloads
2. **Resource requests**: Set appropriate resource requests to avoid over-provisioning
3. **Horizontal Pod Autoscaler**: Automatically scale based on demand
4. **Cluster autoscaler**: Automatically scale nodes based on pod requirements
