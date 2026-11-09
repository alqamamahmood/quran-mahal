#!/bin/bash
# Quran Mahal — Play Console API upload (v1.0.40) — runs in Google Cloud Shell
# as hanzalahmahmood@gmail.com (the Play developer account owner).
# No service-account key needed: uses the user's own credentials.
#
# Pehle (ek dafa, Cloud Shell mein):
#   gcloud auth application-default login --scopes=https://www.googleapis.com/auth/androidpublisher
#   (khulne wale consent page par Allow karo — browser signed in hai)
#
# Usage:
#   bash play_upload.sh <path-to-aab>
#   AAB pehle download karo, e.g.:
#   curl -L -o QuranMahal-1.0.40.aab \
#     https://github.com/alqamamahmood/quran-mahal/releases/download/v1.0.0-native/QuranMahal-1.0.40.aab
#
# Sirf statuses print karta hai — token ya key kabhi print nahi karta.
set -euo pipefail

AAB="${1:?usage: bash play_upload.sh <aab-file>}"
PKG="com.quranmahal.app"
TRACK="alpha"   # closed testing = alpha
API="https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PKG"

TOKEN="$(gcloud auth application-default print-access-token)"

# 1. Naya edit banao
EDIT_JSON="$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' "$API/edits")"
EDIT_ID="$(printf '%s' "$EDIT_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')"
echo "EDIT_ID=$EDIT_ID"

# 2. AAB upload karo
BUNDLE_JSON="$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@$AAB" \
  "$API/edits/$EDIT_ID/bundles?uploadType=media")"
VC="$(printf '%s' "$BUNDLE_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["versionCode"])')"
echo "BUNDLE_VERSION_CODE=$VC"

# 3. Closed testing (alpha) track par release lagao, release notes ke saath
NOTES="Child-safe ads: only family-friendly G-rated ads. Plus the latest features from v1.0.38."
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"releases\": [{\"name\": \"1.0.40\", \"versionCodes\": [\"$VC\"], \"status\": \"completed\", \"releaseNotes\": [{\"language\": \"en-US\", \"text\": \"$NOTES\"}]}]}" \
  "$API/edits/$EDIT_ID/tracks/$TRACK" > /dev/null
echo "TRACK_SET=$TRACK versionCode=$VC"

# 4. Edit commit karo (release review ke liye jati hai)
COMMIT_JSON="$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API/edits/$EDIT_ID:commit")"
COMMIT_ID="$(printf '%s' "$COMMIT_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id","?"))')"
echo "COMMIT_ID=$COMMIT_ID"
echo "UPLOAD_DONE edit=$EDIT_ID track=$TRACK versionCode=$VC"
