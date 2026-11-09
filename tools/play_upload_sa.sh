#!/bin/bash
# Quran Mahal — Play Console API upload (v1.0.40) via SERVICE ACCOUNT key.
# Cloud Shell mein chalta hai — phone verification / OAuth consent NAHI chahiye.
#
# Usage:
#   bash play_upload_sa.sh <service-account-key.json>
#   (key file pehle Cloud Shell mein upload karo — three-dot menu -> Upload)
#
# Script khud karta hai:
#   1. AAB download (GitHub release se) — agar pehle se nahi hai
#   2. google-auth install + service account se androidpublisher token
#   3. Play API: edit -> bundle upload -> alpha track -> commit
#
# Sirf statuses print karta hai — token ya key kabhi print nahi karta.
set -euo pipefail

KEY="${1:?usage: bash play_upload_sa.sh <service-account-key.json>}"
PKG="com.quranmahal.app"
TRACK="alpha"   # closed testing = alpha
AAB="QuranMahal-1.0.40.aab"
API="https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PKG"

# 1. AAB download karo (agar nahi hai)
if [ ! -f "$AAB" ]; then
  curl -L -o "$AAB" https://github.com/alqamamahmood/quran-mahal/releases/download/v1.0.0-native/QuranMahal-1.0.40.aab
fi
echo "AAB_SIZE=$(stat -c%s "$AAB")"

# 2. Service account token (androidpublisher scope)
python3 -m pip install -q --user google-auth 2>/dev/null || true
TOKEN="$(python3 - "$KEY" <<'PYEOF'
import sys
from google.oauth2 import service_account
from google.auth.transport.requests import Request
creds = service_account.Credentials.from_service_account_file(
    sys.argv[1],
    scopes=["https://www.googleapis.com/auth/androidpublisher"],
)
creds.refresh(Request())
print(creds.token)
PYEOF
)"

# 3. Naya edit banao
EDIT_JSON="$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' "$API/edits")"
EDIT_ID="$(printf '%s' "$EDIT_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')"
echo "EDIT_ID=$EDIT_ID"

# 4. AAB upload karo
BUNDLE_JSON="$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@$AAB" \
  "$API/edits/$EDIT_ID/bundles?uploadType=media")"
VC="$(printf '%s' "$BUNDLE_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["versionCode"])')"
echo "BUNDLE_VERSION_CODE=$VC"

# 5. Closed testing (alpha) track par release lagao, release notes ke saath
NOTES="Child-safe ads: only family-friendly G-rated ads. Plus the latest features from v1.0.38."
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"releases\": [{\"name\": \"1.0.40\", \"versionCodes\": [\"$VC\"], \"status\": \"completed\", \"releaseNotes\": [{\"language\": \"en-US\", \"text\": \"$NOTES\"}]}]}" \
  "$API/edits/$EDIT_ID/tracks/$TRACK" > /dev/null
echo "TRACK_SET=$TRACK versionCode=$VC"

# 6. Edit commit karo (release review ke liye jati hai)
COMMIT_JSON="$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API/edits/$EDIT_ID:commit")"
COMMIT_ID="$(printf '%s' "$COMMIT_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id","?"))')"
echo "COMMIT_ID=$COMMIT_ID"
echo "UPLOAD_DONE edit=$EDIT_ID track=$TRACK versionCode=$VC"
