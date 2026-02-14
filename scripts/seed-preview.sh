#!/bin/bash
set -e

# Usage: ./scripts/seed-preview.sh <PR_NUMBER>
# Example: ./scripts/seed-preview.sh 123

if [ -z "$1" ]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

# --- Kubernetes 設定 ---
# 明示的にコンテキストを指定
KUBE_CONTEXT="default"
KUBECTL="kubectl --context=${KUBE_CONTEXT}"

PR_NUMBER=$1
NAMESPACE="pr${PR_NUMBER}"
LOCAL_PORT=5433

echo "=== Seeding Data for PR #${PR_NUMBER} (Context: ${KUBE_CONTEXT}, Namespace: ${NAMESPACE}) ==="

# 1. コンテキストが存在するか事前にチェック
if ! ${KUBECTL} config get-contexts "${KUBE_CONTEXT}" > /dev/null 2>&1; then
  echo "Error: Kubernetes context '${KUBE_CONTEXT}' not found."
  exit 1
fi

# 2. Namespace の存在確認
if ! ${KUBECTL} get namespace "${NAMESPACE}" > /dev/null 2>&1; then
  echo "Error: Namespace ${NAMESPACE} not found. Is the Preview Environment deployed?"
  exit 1
fi

# 3. PostgreSQL Pod の特定
POD_NAME=$(${KUBECTL} get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=postgresql -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)

if [ -z "$POD_NAME" ]; then
    POD_NAME=$(${KUBECTL} get pods -n "${NAMESPACE}" -l app=gearpit-db -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)
fi

if [ -z "$POD_NAME" ]; then
    POD_NAME=$(${KUBECTL} get pods -n "${NAMESPACE}" -l app=postgresql -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)
fi

if [ -z "$POD_NAME" ]; then
  echo "Error: Could not find PostgreSQL pod in namespace ${NAMESPACE}."
  exit 1
fi

echo "Found Database Pod: ${POD_NAME}"

# 4. Port Forward 開始
echo "Starting port-forward to localhost:${LOCAL_PORT}..."
# バックグラウンド実行でもコンテキストを維持
${KUBECTL} port-forward "pod/${POD_NAME}" "${LOCAL_PORT}:5432" -n "${NAMESPACE}" > /dev/null 2>&1 &
PF_PID=$!

# Cleanup trap
cleanup() {
  echo "Cleaning up port-forward (PID: ${PF_PID})..."
  kill "${PF_PID}" 2>/dev/null || true
}
trap cleanup EXIT

# ポートフォワードの準備待ち
sleep 3

# 5. Seeder 実行
echo "Running Go Seeder..."
export DATABASE_URL="host=localhost port=${LOCAL_PORT} user=gearpit password=password dbname=gearpit sslmode=disable"

if go run apps/gearpit-core/cmd/seeder/main.go -host localhost -port "${LOCAL_PORT}" -pr "${PR_NUMBER}"; then
    echo "✅ Seeding Completed Successfully for PR #${PR_NUMBER}"
else
    echo "❌ Seeding Failed"
    exit 1
fi