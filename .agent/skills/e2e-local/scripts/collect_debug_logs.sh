#!/bin/bash

# ==========================================
# 設定: パス解決とファイルの初期化
# ==========================================

# 1. スクリプト自身のディレクトリを絶対パスで取得
#    これにより、どこから実行してもパスがずれません
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 2. 出力先設定 (スクリプトからの相対パスで指定)
TARGET_DIR="${SCRIPT_DIR}"
LOG_FILE="${TARGET_DIR}/_ALL_DEBUG_CONTEXT.txt"
CONTEXT="k3d-gearpit-dev"

# ディレクトリの作成
mkdir -p "${TARGET_DIR}"

# ==========================================
# 実行開始 & ヘッダー作成 (重要)
# ==========================================

# コンテキスト切り替え
kubectl config use-context ${CONTEXT} > /dev/null

# ファイルを【上書きモード(>)】で初期化
# これにより、過去のログが残る可能性を完全に排除します
{
  echo "####################################################################"
  echo "### GEARPIT DEBUG CONTEXT - LATEST SNAPSHOT"
  echo "### ----------------------------------------------------------------"
  echo "### GENERATED AT:  $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "### CONTEXT:       ${CONTEXT}"
  echo "### SCRIPT PATH:   ${SCRIPT_DIR}"
  echo "### NOTE:          Old logs have been overwritten. This is fresh data."
  echo "####################################################################"
  echo ""
} > "${LOG_FILE}"

echo "============================================"
echo " GearPit Debug Log Collector"
echo " Time:   $(date '+%Y-%m-%d %H:%M:%S')"
echo " Output: ${LOG_FILE}"
echo "============================================"

# ==========================================
# 関数定義
# ==========================================

# セクション書き込み関数
write_section() {
    local title="$1"
    local cmd="$2"

    echo "Running: ${title}..."
    {
        echo "########################################################"
        echo "### SECTION: ${title}"
        echo "### COMMAND: ${cmd}"
        echo "########################################################"
        echo ""
        # コマンドを実行し、結果を追記(>>)
        eval "${cmd}"
        echo ""
        echo "### END OF SECTION: ${title}"
        echo ""
    } >> "${LOG_FILE}" 2>&1
}

# ==========================================
# 情報収集メイン処理
# ==========================================

# 1. クラスタ全体の情報を収集
write_section "00_CLUSTER_NODES" "kubectl get nodes -o wide"
write_section "00_CLUSTER_EVENTS" "kubectl get events --sort-by=.metadata.creationTimestamp"

# 2. 全リソースの状態
write_section "01_ALL_RESOURCES" "kubectl get all -o wide"
write_section "01_INGRESS" "kubectl get ingress -o wide"

# 3. Podごとの詳細ログ収集
echo "Collecting Pod Logs..."
PODS=$(kubectl get pods -o jsonpath='{.items[*].metadata.name}')

for POD in $PODS; do
    # 設定情報
    write_section "POD_DESCRIBE: ${POD}" "kubectl describe pod ${POD}"
    
    # 現在のログ
    write_section "POD_LOG_CURRENT: ${POD}" "kubectl logs ${POD} --all-containers=true"
    
    # 直前のログ (Previous)
    # 以前のログがない場合のエラーメッセージもそのまま記録させることで
    # 「再起動は発生していない」という証拠にする
    write_section "POD_LOG_PREVIOUS: ${POD}" "kubectl logs ${POD} --previous --all-containers=true"
done

# 4. 適用されているマニフェストのダンプ
write_section "02_MANIFEST_DUMP" "kubectl get deployment,svc,ingress -o yaml"

# 5. Tiltのビルド＆実行ログ (追加！)
echo "Collecting Tilt Logs..."
# Tiltが起動していない場合はエラーになるため、エラー出力もキャッチする
write_section "03_TILT_LOGS" "tilt logs"

echo "============================================"
echo " DONE!"
echo " Log file generated at: ${LOG_FILE}"
echo "============================================"