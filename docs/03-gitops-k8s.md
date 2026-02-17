# GitOps & Kubernetes Architecture

## Overview
We use a GitOps workflow where `manifests/` is the source of truth.
* **Dev:** Tilt (Local K8s cluster via Kind/K3s).
* **Prod:** ArgoCD.

## Container Strategy (Rust)

### 1. Dockerfile Optimization
Rust compilation is slow. We use `cargo-chef` to cache dependencies.
* **Base Image:** `rust:1.80-slim-bookworm` (Build) -> `gcr.io/distroless/cc-debian12` (Runtime).
* **Rationale:** Distroless `cc` is required for Rust binaries linked against libc.

### 2. Build Stages
1.  **Planner:** `cargo chef prepare` (computes lockfile recipe).
2.  **Cacher:** `cargo chef cook` (compiles dependencies *only*).
3.  **Builder:** Compiles actual source code.
4.  **Runtime:** Copies binary to minimal image.

## Local Development (Tilt)

### Tiltfile Configuration
We prioritize fast feedback loops for Rust.
* **Live Reload:** The `gearpit-core` container runs `cargo-watch`.
* **Sync:** Tilt syncs source code changes directly into the running container, triggering `cargo-watch` to recompile (incremental build).
    * *Note:* Initial build takes time, but updates are fast.

## CI/CD Pipeline (GitHub Actions)
* **Protobuf:** Checks strictly for breaking changes (`buf breaking`).
* **Test:** Runs `cargo test` and `playwright` (E2E).
* **Build:** Pushes images to GHCR only on `main`.