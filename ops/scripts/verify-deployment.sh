#!/bin/bash
set -e

PR_NUMBER=$1
NAMESPACE=$2
EXPECTED_SHA=$3
TARGET_URL="http://web-pr${PR_NUMBER}.192.168.40.100.nip.io"

if [ -z "$PR_NUMBER" ] || [ -z "$NAMESPACE" ] || [ -z "$EXPECTED_SHA" ]; then
  echo "Usage: $0 <PR_NUMBER> <NAMESPACE> <EXPECTED_SHA>"
  exit 1
fi

echo "Starting deployment verification for PR #$PR_NUMBER in namespace $NAMESPACE..."
echo "Target URL: $TARGET_URL"
echo "Expected SHA Match: $EXPECTED_SHA"

# 1. Wait for Deployment Existence (Cold Start handling)
echo "Waiting for deployment 'gearpit-web' to exist..."
START_TIME=$(date +%s)
TIMEOUT=300

while true; do
  if kubectl get deployment gearpit-web -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "Deployment found."
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "Timeout waiting for deployment creation."
    exit 1
  fi
  
  sleep 5
done

# 2. Image Tag Verification (SHA Check)
echo "Verifying image tag contains SHA: $EXPECTED_SHA ..."
START_TIME=$(date +%s)
TIMEOUT=300

while true; do
  CURRENT_IMAGE=$(kubectl get deployment gearpit-web -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
  
  # Check if image contains the SHA (handles both 'sha-<SHA>' and just '<SHA>' formats if present)
  if [[ "$CURRENT_IMAGE" == *"$EXPECTED_SHA"* ]]; then
    echo "Image tag matched SHA: $CURRENT_IMAGE"
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "Timeout waiting for image update."
    echo "Current Image: $CURRENT_IMAGE"
    echo "Expected SHA in Tag: $EXPECTED_SHA"
    exit 1
  fi
  
  echo "Waiting for image update... (Current: $CURRENT_IMAGE)"
  sleep 5
done

# 3. Rollout Status
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/gearpit-web -n "$NAMESPACE" --timeout=300s

# 4. Health Check
echo "Performing health check on $TARGET_URL..."
START_TIME=$(date +%s)
TIMEOUT=300

while true; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL")
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Health check passed: HTTP 200"
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "Timeout waiting for health check (HTTP 200)."
    echo "Last Status: $HTTP_STATUS"
    exit 1
  fi
  
  echo "Waiting for HTTP 200... (Current: $HTTP_STATUS)"
  sleep 5
done

echo "Deployment verification successful!"
