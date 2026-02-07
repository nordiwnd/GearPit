#!/bin/bash
set -e

PR_NUMBER=$1
NAMESPACE=$2
# $3 (SHA) is accepted but ignored in this logic as we force restart to pull latest image
TARGET_URL="http://web-pr${PR_NUMBER}.192.168.40.100.nip.io"
APPS=("gearpit-app" "gearpit-web")

if [ -z "$PR_NUMBER" ] || [ -z "$NAMESPACE" ]; then
  echo "Usage: $0 <PR_NUMBER> <NAMESPACE> [EXPECTED_SHA]"
  exit 1
fi

echo "Starting deployment verification for PR #$PR_NUMBER in namespace $NAMESPACE..."
echo "Target URL: $TARGET_URL"
echo "Apps: ${APPS[*]}"

# 1. Wait for All Deployments Existence (Cold Start handling)
echo "1. Waiting for all deployments to exist..."
START_TIME=$(date +%s)
TIMEOUT=300

while true; do
  ALL_EXIST=true
  for APP in "${APPS[@]}"; do
    if ! kubectl get deployment "$APP" -n "$NAMESPACE" > /dev/null 2>&1; then
      echo "Waiting for deployment '$APP'..."
      ALL_EXIST=false
      break
    fi
  done
  
  if [ "$ALL_EXIST" = true ]; then
    echo "All deployments found."
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "Timeout waiting for deployments creation."
    exit 1
  fi
  
  sleep 5
done

# 2. Trigger Force Update (Ensure latest image is pulled)
echo "2. Triggering force update (rollout restart) to pull latest images..."
# Restart all apps
for APP in "${APPS[@]}"; do
  kubectl rollout restart deployment/"$APP" -n "$NAMESPACE"
done
echo "Rollout restart triggered."

# 3. Wait for Rollout Completion
echo "3. Waiting for rollout to complete..."
for APP in "${APPS[@]}"; do
  echo "Waiting for '$APP' rollout..."
  if ! kubectl rollout status deployment/"$APP" -n "$NAMESPACE" --timeout=300s; then
    echo "Timeout waiting for '$APP' rollout."
    exit 1
  fi
  echo "'$APP' rollout complete."
done

# 4. Health Check
echo "4. Performing health check on $TARGET_URL..."
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
