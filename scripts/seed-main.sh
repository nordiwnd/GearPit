set -e
NAMESPACE="gearpit"
LOCAL_PORT=5433 # Use a different port to avoid conflict with local dev DB (usually 5432)

echo "=== Seeding Data for Gearpit (Namespace: ${NAMESPACE}) ==="

# 1. Check if namespace exists
if ! kubectl get namespace "${NAMESPACE}" > /dev/null 2>&1; then
  echo "Error: Namespace ${NAMESPACE} not found. Is the Preview Environment deployed?"
  exit 1
fi

# 2. Find the PostgreSQL Pod
# Assumption: The statefulset or pod label selector matches "app.kubernetes.io/name=postgresql" or similar.
# Adjust selector based on actual helm chart / manifest.
POD_NAME=$(kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=postgresql -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)

if [ -z "$POD_NAME" ]; then
    # Fallback try generic app label if postgres specific one fails, or standard storage label
    POD_NAME=$(kubectl get pods -n "${NAMESPACE}" -l app=gearpit-db -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)
fi

if [ -z "$POD_NAME" ]; then
    # Fallback try generic app label if postgres specific one fails, or standard storage label
    POD_NAME=$(kubectl get pods -n "${NAMESPACE}" -l app=postgresql -o jsonpath="{.items[0].metadata.name}" 2>/dev/null || true)
fi

if [ -z "$POD_NAME" ]; then
  echo "Error: Could not find PostgreSQL pod in namespace ${NAMESPACE}."
  exit 1
fi

echo "Found Database Pod: ${POD_NAME}"

# 3. Start Port Forward
echo "Starting port-forward to localhost:${LOCAL_PORT}..."
kubectl port-forward "pod/${POD_NAME}" "${LOCAL_PORT}:5432" -n "${NAMESPACE}" > /dev/null 2>&1 &
PF_PID=$!

# Cleanup trap
cleanup() {
  echo "Cleaning up port-forward (PID: ${PF_PID})..."
  kill "${PF_PID}" 2>/dev/null || true
}
trap cleanup EXIT

# Wait for port-forward to be ready
sleep 3

# 4. Run Seeder
echo "Running Go Seeder..."
# DB Connection params for the preview environment (default user/pass from helm chart usually)
# If these differ per environment, we might need to fetch secrets.
# For now assuming defaults as per infrastructure docs or common dev practice.

export DATABASE_URL="host=localhost port=${LOCAL_PORT} user=gearpit password=password dbname=gearpit sslmode=disable"

# Run the seeder
if go run apps/gearpit-core/cmd/seeder/main.go -host localhost -port "${LOCAL_PORT}" -pr "${PR_NUMBER}"; then
    echo "✅ Seeding Completed Successfully Gearpit Main"
else
    echo "❌ Seeding Failed"
    exit 1
fi
