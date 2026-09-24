#!/usr/bin/env bash
# Asks for the upload-key password (hidden) and writes it into
# android/keystore.properties, which is git-ignored. The password is never
# printed, logged, or stored anywhere else.
set -euo pipefail
FILE="$(cd "$(dirname "$0")/.." && pwd)/android/keystore.properties"
[ -f "$FILE" ] || cp "$(dirname "$FILE")/keystore.properties.example" "$FILE"
read -r -s -p "Signing key password: " P
echo
[ -n "$P" ] || { echo "No password entered — nothing changed."; exit 1; }
P="$P" python3 - "$FILE" <<'PY'
import os, re, sys
path, pw = sys.argv[1], os.environ["P"]
text = open(path).read()
text = re.sub(r"^storePassword=.*$", lambda m: "storePassword=" + pw, text, flags=re.M)
text = re.sub(r"^keyPassword=.*$", lambda m: "keyPassword=" + pw, text, flags=re.M)
open(path, "w").write(text)
PY
unset P
chmod 600 "$FILE"
echo "Password saved to android/keystore.properties (private to your user)."
