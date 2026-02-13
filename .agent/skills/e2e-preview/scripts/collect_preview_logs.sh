#!/bin/bash

# ==========================================
# 設定: パス解決と初期化
# ==========================================
PR_NUM=$1
BRANCH_NAME=$2
if [ -z "$PR_NUM" ]; then
    echo "Usage: ./collect_preview_logs.sh <PR_NUMBER>"
    exit 1
fi

NAMESPACE="pr${PR_NUM}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${SCRIPT_DIR}"
LOG_FILE="${TARGET_DIR}/_PREVIEW_DEBUG_CONTEXT.txt"
# コンテキストを default に固定
TARGET_CONTEXT="default"

mkdir -p "${TARGET_DIR}"

# ==========================================
# Stage 1: GitHub Actions のビルド待機
# ==========================================
echo "### Stage 1: Waiting for GitHub Actions build..."

if [ -z "${BRANCH_NAME}" ]; then
    BRANCH_NAME=$(git branch --show-current)
fi

RUN_ID=$(gh run list --branch "${BRANCH_NAME}" --limit 1 --json databaseId -q '.[0].databaseId')

if [ -z "$RUN_ID" ]; then
    echo "Error: No GitHub Actions run found for PR ${PR_NUM}."
    exit 1
fi

echo "Watching GHA Run: ${RUN_ID}..."
gh run watch "$RUN_ID"

CONCLUSION=$(gh run view "$RUN_ID" --json conclusion -q '.conclusion')

if [ "$CONCLUSION" != "success" ]; then
    echo "Build FAILED. Collecting GHA logs..."
    {
        echo "########################################################"
        echo "### GHA BUILD FAILED: ${RUN_ID}"
        echo "### TIMESTAMP: $(date '+%Y-%m-%d %H:%M:%S %Z')"
        echo "########################################################"
        gh run view "$RUN_ID" --log
    } > "${LOG_FILE}"
    exit 1
fi

echo "Build SUCCEEDED. Proceeding to Stage 2..."

# ==========================================
# Stage 2: Context 切り替え & K8s ログ収集
# ==========================================
echo "### Stage 2: Using context '${TARGET_CONTEXT}' and collecting logs in ${NAMESPACE}..."

# 明示的にコンテキストを default に切り替える
kubectl config use-context "${TARGET_CONTEXT}" > /dev/null

# 最新イメージを反映させるためのロールアウト
kubectl rollout restart deployment -n "${NAMESPACE}"
kubectl rollout status deployment -n "${NAMESPACE}" --timeout=120s

# ログファイルの初期化（上書きモード）
{
  echo "####################################################################"
  echo "### PREVIEW ENVIRONMENT DEBUG CONTEXT (PR: ${PR_NUM})"
  echo "### GENERATED AT: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "### CONTEXT:      $(kubectl config current-context)"
  echo "### NAMESPACE:    ${NAMESPACE}"
  echo "####################################################################"
  echo ""
} > "${LOG_FILE}"

# セクション書き込み関数
write_section() {
    local title="$1"
    local cmd="$2"
    {
        echo "########################################################"
        echo "### SECTION: ${title}"
        echo "### COMMAND: ${cmd}"
        echo "########################################################"
        echo ""
        eval "${cmd}"
        echo ""
        echo "### END OF SECTION"
        echo ""
    } >> "${LOG_FILE}" 2>&1
}

# 情報収集
write_section "00_NAMESPACE_EVENTS" "kubectl get events -n ${NAMESPACE} --sort-by=.metadata.creationTimestamp"
write_section "01_ALL_RESOURCES" "kubectl get all -n ${NAMESPACE} -o wide"

PODS=$(kubectl get pods -n "${NAMESPACE}" -o jsonpath='{.items[*].metadata.name}')
for POD in $PODS; do
    write_section "POD_DESCRIBE: ${POD}" "kubectl describe pod ${POD} -n ${NAMESPACE}"
    write_section "POD_LOG_CURRENT: ${POD}" "kubectl logs ${POD} -n ${NAMESPACE} --all-containers=true"
    write_section "POD_LOG_PREVIOUS: ${POD}" "kubectl logs ${POD} -n ${NAMESPACE} --previous --all-containers=true"
done

write_section "02_MANIFEST_DUMP" "kubectl get deployment,svc,ingress -n ${NAMESPACE} -o yaml"

echo "============================================"
echo " DONE!"
echo " Preview logs generated at: ${LOG_FILE}"
echo "============================================"