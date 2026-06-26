# Tracing

## Mục tiêu

- Triển khai Jaeger all-in-one để nhận trace qua OTLP HTTP/gRPC và Zipkin.
- Các service Node.js dùng OpenTelemetry HTTP/Express/Mongoose instrumentation và gửi trace qua Zipkin.
- Python optimizer dùng OpenTelemetry FastAPI instrumentation.
- Xem request flow giữa các service trên Jaeger UI.

## Triển khai Jaeger bằng Ansible

Chạy trên máy có kubeconfig trỏ tới Kubernetes cluster:

```bash
cd observability/Tracing
ansible-galaxy collection install kubernetes.core
ansible-playbook -i localhost, -c local playbook.yaml
```

Stack sẽ tạo:

- Namespace `tracing`
- Deployment `jaeger`
- Service `jaeger-collector` nhận OTLP tại `4317`, `4318` và Zipkin tại `9411`
- Service `jaeger-query` expose UI qua NodePort `30168`

Truy cập Jaeger:

```bash
kubectl get node -o wide
kubectl get svc -n tracing jaeger-query
```

Mở:

```text
http://<NODE_PUBLIC_IP>:30168
```

Nếu dùng cloud provider, cần mở inbound security group TCP `30168`.

## Cấu hình ứng dụng

Python optimizer trong Helm chart gửi trace tới OTLP:

```text
http://jaeger-collector.tracing.svc.cluster.local:4318/v1/traces
```

Các Node.js service gửi trace tới Zipkin endpoint của Jaeger:

```text
http://jaeger-collector.tracing.svc.cluster.local:9411/api/v2/spans
```

Các biến chính:

- `OTEL_SERVICE_NAME`: tên service hiển thị trên Jaeger.
- `OTEL_EXPORTER_OTLP_ENDPOINT`: endpoint OTLP HTTP collector cho Python optimizer.
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`: endpoint OTLP HTTP cụ thể cho trace của Python optimizer.
- `OTEL_EXPORTER_ZIPKIN_ENDPOINT`: endpoint Zipkin collector cho Node.js service.
- `OTEL_TRACES_EXPORTER`: loại exporter đang dùng theo service.
- `OTEL_METRICS_EXPORTER=none`: không gửi metric qua OpenTelemetry vì Prometheus đã phụ trách metrics.
- `OTEL_LOGS_EXPORTER=none`: không gửi log qua OpenTelemetry vì EFK đã phụ trách logs.

## Kiểm tra nhanh

Gửi request vào service:

```bash
kubectl port-forward -n drone-delivery svc/drone-delivery-order-service 5003:5003
curl http://localhost:5003/api/orders
```

Hoặc tạo request tối ưu tuyến nếu frontend/backend đang có dữ liệu đơn hàng.

Kiểm tra Jaeger:

```text
Search -> Service: order-service -> Find Traces
```

Nếu gọi luồng order-service sang python-optimizer, trace sẽ có span của cả hai service khi header trace context được propagate.
