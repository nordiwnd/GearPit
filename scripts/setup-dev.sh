#!/bin/bash
set -e

# Default Cluster Name
CLUSTER_NAME="gearpit-dev"

# 1. Check if k3d is installed
if ! command -v k3d &> /dev/null; then
  echo "Error: k3d is not installed. Please install k3d first."
  exit 1
fi

# 2. Check if cluster exists
if k3d cluster list | grep -q "$CLUSTER_NAME"; then
  echo "Cluster '$CLUSTER_NAME' already exists."
else
  echo "Cluster '$CLUSTER_NAME' does not exist. Creating..."
  # 3. Create cluster
  k3d cluster create "$CLUSTER_NAME" \
    --registry-create gearpit-registry:0.0.0.0:5000 \
    -p "8080:80@loadbalancer" \
    -p "3000:3000@loadbalancer"
  echo "Cluster '$CLUSTER_NAME' created successfully."
fi

# Ensure kubeconfig is updated (optional but helpful)
k3d kubeconfig merge "$CLUSTER_NAME" --kubeconfig-switch-context
echo "Kubeconfig merged and context switched to k3d-$CLUSTER_NAME"
