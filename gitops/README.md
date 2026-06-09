# GitOps layout

This folder holds the Kubernetes delivery layer for the drone delivery thesis project.

## What lives here

- `argocd/` for ArgoCD `AppProject` and `ApplicationSet` manifests
- `charts/drone-delivery/` for the Helm chart that deploys MongoDB, the backend services, the Python optimizer, and the frontend
- `environments/` for environment-specific deployment notes or overlays if you want to extend the layout later

## VM workflow

1. Create a Linux VM in Virtual Machine Manager.
2. Install `kubectl`, RKE2 or k3s, and ArgoCD on the VM.
3. Log in to Docker Hub locally, run `scripts/publish-dockerhub-images.sh`, and push the app images.
4. Apply the manifests from `gitops/argocd/`.
5. Point the `ApplicationSet` at your Git repository URL.
6. The Helm values files now default to the Docker Hub namespace `khiempg225868`.
7. The current ApplicationSet deploys one production release into the `drone-delivery` namespace.

## Notes

- Do not commit real secrets into the Helm values files.
- If you want stricter secret handling, add SealedSecrets or ExternalSecrets in a later step.
- The frontend image reads runtime API URLs from `env.js`, so you can change endpoints through Helm values without rebuilding the React app.
- The frontend Gateway API manifest stays disabled until you confirm the Gateway Controller and GatewayClass on the VM.
- Before pushing to Git, keep the Docker Hub namespace aligned with `khiempg225868` in `gitops/charts/drone-delivery/values*.yaml` and `scripts/publish-dockerhub-images.sh`.
