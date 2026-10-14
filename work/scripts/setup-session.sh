#!/usr/bin/env bash
# Run once per new cloud VM: deps, headless-Chromium trust for the session proxy CA, local server.
set -e
cd "$(dirname "$0")/../.."
[ -d node_modules/three ] || npm install
if ! command -v certutil >/dev/null; then (apt-get install -y -q libnss3-tools || (apt-get update -q && apt-get install -y -q libnss3-tools)) >/dev/null; fi
mkdir -p "$HOME/.pki/nssdb"
certutil -L -d "sql:$HOME/.pki/nssdb" | grep -q ccr-agent-proxy || certutil -A -d "sql:$HOME/.pki/nssdb" -n ccr-agent-proxy -t "C,," -i /root/.ccr/agent-proxy-ca.crt
curl -s -o /dev/null http://localhost:8080/ || (nohup npm run serve >/dev/null 2>&1 &)
echo "ready"
