# 03. GitOps & Kubernetes Guidelines

## 1. Target Infrastructure
- **Cluster**: k3s on Raspberry Pi (ARM64 Native)
- **Ingress Controller**: Traefik (default in k3s)
- **GitOps Operator**: ArgoCD (running in `argocd` namespace)
- **Secret Management**: Bitnami SealedSecrets

## 2. Directory Structure & Constraints

Strictly maintain the separation between Application manifests and GitOps configurations.

<k8s_structure>
  <directory path="manifests/apps/">
    <description>Kustomize definitions for the applications.</description>
    <structure>
      - `base/`: Common resources (Deployment, Service, Ingress).
      - `overlays/main/`: Production settings (replicas, domain names, resource limits).
      - `overlays/preview/`: Ephemeral settings for PR previews (e.g., ephemeral DB patches).
    </structure>
  </directory>
  <directory path="ops/">
    <description>ArgoCD definitions and Cluster bootstraps.</description>
    <contents>`Application`, `ApplicationSet`, and `SealedSecret` manifests.</contents>
  </directory>
</k8s_structure>

### ⚠️ Constraints for AI Agents
- **NEVER** write raw `Secret` manifests containing plaintext base64 credentials. Always assume the use of `SealedSecrets` (via `kubeseal`).
- **NEVER** hardcode environment-specific URLs or secrets in `manifests/apps/.../base/`. Use Kustomize `patches` in overlays.

## 3. Deployment Workflow (The GitOps Loop)

### Production (`main` branch)
1. **Build**: GitHub Actions builds multi-arch (`linux/amd64`, `linux/arm64`) images using QEMU and pushes to GHCR with the Git commit SHA as the tag.
2. **Update Manifest**: CI automatically runs `kustomize edit set image ...` on `manifests/apps/.../overlays/main`, commits the change, and pushes back to `main`.
3. **Sync**: ArgoCD detects the new commit in `main` and syncs the changes to the k3s cluster.

### Preview Environments (Pull Requests)
1. **Build**: CI builds images and tags them with `pr-{number}` (e.g., `ghcr.io/nordiwnd/gearpit-app:pr-123`).
2. **Provision**: ArgoCD `ApplicationSet` (defined in `ops/applications/gearpit-previews.yaml`) detects the PR via GitHub Token.
3. **Deploy**: ArgoCD dynamically creates a new Namespace (`pr{number}`) and deploys `manifests/apps/.../overlays/preview`.
   - Ingress hosts are patched dynamically via Nip.io (e.g., `api-pr123.192.168.40.100.nip.io`).
4. **Teardown**: Automated upon PR closure.

## 4. Coding Standard for Manifests
- **Resource Limits**: ALWAYS define `resources.limits` (CPU/Memory) for ARM64 stability.
- **Health Checks**: ALWAYS define `livenessProbe` and `readinessProbe` for Deployments.

```yaml
# ✅ GOOD: Standard Deployment snippet
resources:
  limits:
    cpu: "250m"
    memory: "128Mi"
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
```

## 5. Constraint & Networking Rules
- **Secret Management**: Do not write plain text secrets in manifests. (Currently managed in `ops/`).
- **Internal DNS (Service-to-Service)**: 
  - Web to App communication MUST use `gearpit-app-svc`.
  - App to DB communication MUST use `gearpit-db-svc`.
  - Port numbers in code MUST match the Service Port (usually `80` or `5432`), not the underlying container's Target Port.