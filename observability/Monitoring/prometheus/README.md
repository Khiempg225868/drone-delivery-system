# Prometheus Role

Triển khai Prometheus server vào Kubernetes bằng `kubernetes.core.k8s`.

## Requirements

- `ansible-playbook`
- Collection `kubernetes.core`
- kubeconfig có quyền tạo namespace, RBAC, Deployment, Service

## Role Variables

Xem `defaults/main.yml`.

## Dependencies

Không có role dependency.

## Example Playbook

```yaml
- hosts: all
  gather_facts: false
  roles:
    - prometheus
```

## License

MIT
