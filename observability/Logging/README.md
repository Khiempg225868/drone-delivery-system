# Logging

## Mục tiêu

- Triển khai stack EFK bằng Ansible:
  - Elasticsearch lưu log.
  - Fluentd thu thập log container trong namespace `drone-delivery`.
  - Kibana truy vấn log qua giao diện web.
- Các service ghi log HTTP request ra stdout dạng JSON, có đủ:
  - `request_path`
  - `http_method`
  - `response_code`

## Cấu trúc

```text
observability/Logging
├── playbook.yaml
└── efk
    ├── namespace.yaml
    ├── elastic
    │   ├── elasticsearch_svc.yaml
    │   └── elasticsearch_statefulset.yaml
    ├── fluentd
    │   ├── fluentd-configmap.yaml
    │   └── fluentd.yaml
    └── kibana
        └── kibana.yaml
```

## Triển khai

Chạy trên máy có kubeconfig trỏ tới cluster:

```bash
cd ~/Logging
ansible-playbook -i localhost, -c local playbook.yaml \
  -e ansible_python_interpreter=$HOME/ansible-k8s-venv/bin/python
```

Nếu chạy từ repo:

```bash
cd observability/Logging
ansible-playbook -i localhost, -c local playbook.yaml \
  -e ansible_python_interpreter=$HOME/ansible-k8s-venv/bin/python
```

## Kiểm tra

```bash
kubectl get pods -n kube-logging
kubectl get svc -n kube-logging
kubectl logs -n kube-logging deploy/elasticsearch --tail=50
kubectl logs -n kube-logging deploy/kibana --tail=50
kubectl logs -n kube-logging ds/fluentd --tail=50
```

Kibana được expose qua NodePort `30111`:

```text
http://<NODE_PUBLIC_IP>:30111
```

Nếu dùng Alibaba Cloud, cần mở inbound security group TCP `30111`.

## Tạo log thử

Gửi request vào một service, ví dụ order-service:

```bash
kubectl port-forward -n drone-delivery svc/drone-delivery-order-service 5003:5003
curl http://localhost:5003/api/orders
```

Kiểm tra stdout service:

```bash
kubectl logs -n drone-delivery deploy/drone-delivery-order-service --tail=50
```

Sẽ có log dạng:

```json
{"event":"http_request","service":"order-service","request_path":"/api/orders","http_method":"GET","response_code":200,"duration_ms":12}
```

## Kibana

Vào Kibana:

```text
Stack Management -> Data Views -> Create data view
```

Tạo data view:

```text
Name: drone-delivery-logs
Index pattern: drone-delivery-logs-*
Time field: @timestamp
```

Sau đó vào:

```text
Discover
```

Tìm log:

```text
event: "http_request"
```

Hoặc lọc theo service:

```text
service: "order-service"
```

## Ghi chú

- Elasticsearch dùng `emptyDir` để đơn giản cho môi trường thesis/demo, tránh phụ thuộc PersistentVolume.
- Fluentd chỉ tail log container trong namespace `drone-delivery` bằng path `/var/log/containers/*_drone-delivery_*.log`.
- Namespace `kube-logging` được label Pod Security `privileged` vì Fluentd cần mount hostPath `/var/log`.
