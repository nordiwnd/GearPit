#!/bin/bash

BASE_URL="http://localhost:3001"

echo "Checking API Health..."
curl -s --connect-timeout 5 --max-time 10 "$BASE_URL/health"
echo ""

# Create Gear
echo "Creating Gear..."
GEAR_PAYLOAD='{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "name": "Test Sleeping Bag",
  "weight_g": 1000,
  "price": 200,
  "manufacturer": "Nemo",
  "category": "SleepingBag",
  "default_packing_category": "InPack",
  "properties": { "type": "Other", "data": {} }
}'
GEAR_RES=$(curl -s --connect-timeout 5 --max-time 10 -X POST "$BASE_URL/gears" -H "Content-Type: application/json" -d "$GEAR_PAYLOAD")
echo "Gear Created: $GEAR_RES"
GEAR_ID=$(echo $GEAR_RES | jq -r '.id')
echo "Gear ID: $GEAR_ID"

if [ "$GEAR_ID" == "null" ]; then
  echo "Failed to create gear"
  exit 1
fi

# Create Loadout with Gear
echo "Creating Loadout..."
LOADOUT_PAYLOAD_FIXED='{
  "name": "Test Loadout",
  "description": "Integration Test Loadout",
  "items": [
    {
      "gear_id": "'$GEAR_ID'",
      "quantity": 1,
      "packing_category": null
    }
  ]
}'

LOADOUT_RES=$(curl -s --connect-timeout 5 --max-time 10 -X POST "$BASE_URL/loadouts" -H "Content-Type: application/json" -d "$LOADOUT_PAYLOAD_FIXED")
echo "Loadout Created: $LOADOUT_RES"
LOADOUT_ID=$(echo $LOADOUT_RES | jq -r '.id')
echo "Loadout ID: $LOADOUT_ID"

if [ "$LOADOUT_ID" == "null" ]; then
  echo "Failed to create loadout"
  exit 1
fi

# Get Loadout Details
echo "Fetching Loadout Details..."
DETAIL_RES=$(curl -s --connect-timeout 5 --max-time 10 "$BASE_URL/loadouts/$LOADOUT_ID")
echo "Loadout Detail: $DETAIL_RES"

# Check weight
TOTAL_WEIGHT=$(echo $DETAIL_RES | jq -r '.total_weight_g')
echo "Total Weight: $TOTAL_WEIGHT"

if [ "$TOTAL_WEIGHT" == "1000" ]; then
  echo "Weight Verification PASSED"
else
  echo "Weight Verification FAILED (Expected 1000, got $TOTAL_WEIGHT)"
fi
