#!/usr/bin/env bash
#
# FlirtIQ — Android APK builder (run on your OWN machine, not in the cloud env)
#
# Builds a signed Android APK from the TWA config using Bubblewrap.
# Run this from the repo root:  bash play-store/build-apk.sh
#
# Requirements: Node.js 16+ and a JDK (Bubblewrap will offer to install its
# own JDK 17 + Android SDK on first run — say Yes to both).
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$REPO_ROOT/twa-build"
KEYSTORE="$BUILD_DIR/flirtiq.keystore"
ALIAS="flirtiq"

echo "==> FlirtIQ APK builder"
echo

# --- 0. sanity checks -------------------------------------------------------
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v keytool >/dev/null 2>&1 || { echo "ERROR: keytool (JDK) not found. Install a JDK (e.g. Temurin 17)."; exit 1; }

# --- 1. install bubblewrap --------------------------------------------------
if ! command -v bubblewrap >/dev/null 2>&1; then
  echo "==> Installing @bubblewrap/cli globally..."
  npm install -g @bubblewrap/cli
fi

mkdir -p "$BUILD_DIR"
cp "$REPO_ROOT/twa-manifest.json" "$BUILD_DIR/twa-manifest.json"

# --- 2. generate (or reuse) the signing keystore ----------------------------
if [ -f "$KEYSTORE" ]; then
  echo "==> Reusing existing keystore at $KEYSTORE"
else
  echo "==> Generating signing keystore."
  echo "    You'll be asked for a password — REMEMBER IT. You cannot update"
  echo "    the app on the Play Store without this keystore + password."
  echo
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=FlirtIQ, OU=Mobile, O=FlirtIQ, L=, ST=, C=IN"
fi

# --- 3. build the APK + AAB -------------------------------------------------
echo
echo "==> Building the Android app (this downloads the Android SDK on first run)..."
cd "$BUILD_DIR"
bubblewrap build

# --- 4. show outputs + the SHA-256 for assetlinks.json ----------------------
echo
echo "==> Build complete. Artifacts in: $BUILD_DIR"
ls -1 "$BUILD_DIR"/*.apk "$BUILD_DIR"/*.aab 2>/dev/null || true
echo
echo "==> SHA-256 fingerprint of your UPLOAD key (this keystore):"
keytool -list -v -keystore "$KEYSTORE" -alias "$ALIAS" 2>/dev/null \
  | grep -A1 "SHA256:" | grep -i "sha256" || true
echo
cat <<'NOTE'
------------------------------------------------------------------------
NEXT STEPS
------------------------------------------------------------------------
1. Upload  app-release-bundle.aab  (preferred) to Google Play Console.

2. assetlinks.json fingerprint:
   - If you use Play App Signing (recommended, default for new apps),
     Google re-signs your app. Use the SHA-256 from:
       Play Console -> your app -> Setup -> App signing
         -> "App signing key certificate"
   - If you sideload the signed APK directly for testing, use the
     SHA-256 printed above (your upload key).
   Set that value as the ANDROID_SHA256_CERT env var in Vercel, then
   redeploy so /.well-known/assetlinks.json serves it.

3. Keep flirtiq.keystore + its password BACKED UP and SECRET. It is NOT
   committed to git (see .gitignore). Losing it means you can never push
   an update under the same app.
------------------------------------------------------------------------
NOTE
