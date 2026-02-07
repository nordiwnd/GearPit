#!/bin/bash
set -e

PR_NUMBER=$1
NAMESPACE=$2
TARGET_URL="http://web-pr${PR_NUMBER}.192.168.40.100.nip.io"
EXPECTED_TAG="pr-${PR_NUMBER}"

if [ -z "$PR_NUMBER" ] || [ -z "$NAMESPACE" ]; then
  echo "Usage: $0 <PR_NUMBER> <NAMESPACE>"
  exit 1
fi

echo "Starting deployment verification for PR #$PR_NUMBER in namespace $NAMESPACE..."
echo "Target URL: $TARGET_URL"
echo "Expected Tag: $EXPECTED_TAG"

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

# 2. Image Tag Verification
echo "Verifying image tag..."
START_TIME=$(date +%s)
TIMEOUT=300

while true; do
  CURRENT_IMAGE=$(kubectl get deployment gearpit-web -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
  
  if [[ "$CURRENT_IMAGE" == *"$EXPECTED_TAG"* ]]; then
    echo "Image tag matched: $CURRENT_IMAGE"
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "Timeout waiting for image update. Current: $CURRENT_IMAGE, Expected: *$EXPECTED_TAG*"
    exit 1
  fi
  
  echo "Waiting for image update... (Current: $CURRENT_IMAGE)"
  sleep 10
done

# 3. Rollout Status
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/gearpit-web -n "$NAMESPACE" --timeout=300s

# 4. Health Check
echo "Performing health check on $TARGET_URL..."
START_TIME=$(date +%s)
TIMEOUT=300

while true; do
  if curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL" | grep -q "200"; then
    echo "Health check passed!"
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "Timeout waiting for health check."
    exit 1
  fi
  
  echo "Waiting for HTTP 200..."
  sleep 5
done

echo "Verification successful!"
