# Monitoring

## Mục tiêu

- App expose metrics qua HTTP path `/metrics`.
- Ansible role triển khai Prometheus lên Kubernetes.
- Prometheus scrape metrics của các service trong namespace `drone-delivery`.

## Metrics endpoint

Backend Node.js dùng `prom-client` và expose:

```text
GET /metrics
```

Python optimizer dùng `prometheus-fastapi-instrumentator` và expose:

```text
GET /metrics
```

Các service trong Helm chart được gắn annotation:

```yaml
prometheus.io/scrape: "true"
prometheus.io/path: "/metrics"
prometheus.io/port: "<service-port>"
```

## Triển khai Prometheus bằng Ansible

Chạy trên máy có kubeconfig trỏ tới Kubernetes cluster:

```bash
cd obserbility/Monitoring
ansible-galaxy collection install kubernetes.core
ansible-playbook -i localhost, -c local playbook.yaml
```

Role sẽ tạo:

- Namespace `monitoring`
- ServiceAccount/RBAC cho Prometheus discovery
- ConfigMap `prometheus-config`
- Deployment `prometheus`
- Service NodePort `30169`

Truy cập Prometheus:

```bash
kubectl get node -o wide
kubectl get svc -n monitoring prometheus
```

Mở:

```text
http://<NODE_PUBLIC_IP>:30169
```

Kiểm tra target trong giao diện Prometheus:

```text
Status -> Targets
```

## Biến chính

Có thể chỉnh tại `prometheus/defaults/main.yml`:

- `prometheus_namespace`: namespace cài Prometheus, mặc định `monitoring`
- `prometheus_node_port`: NodePort truy cập Prometheus, mặc định `30169`
- `prometheus_scrape_namespaces`: namespace app cần discovery, mặc định `drone-delivery`
- `prometheus_app_targets`: static targets mặc định cho các service của hệ thống

Các target mặc định:

- `drone-delivery-auth-service.drone-delivery.svc.cluster.local:5001`
- `drone-delivery-delivery-service.drone-delivery.svc.cluster.local:5002`
- `drone-delivery-order-service.drone-delivery.svc.cluster.local:5003`
- `drone-delivery-notification-service.drone-delivery.svc.cluster.local:5004`
- `drone-delivery-python-optimizer.drone-delivery.svc.cluster.local:8001`

## Kiểm tra nhanh

```bash
kubectl get pods -n monitoring
kubectl logs -n monitoring deploy/prometheus
kubectl port-forward -n drone-delivery svc/drone-delivery-order-service 5003:5003
curl http://localhost:5003/metrics
```
