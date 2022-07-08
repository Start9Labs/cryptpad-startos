#!/bin/bash

set -e

TOR_ADDRESS=$(yq e '.tor-address' /cryptpad/main/start9/config.yaml)
SANDBOX_TOR_ADDRESS=$(yq e '.sandbox-tor-address' /cryptpad/main/start9/config.yaml)
LAN_ADDRESS=$(echo "$TOR_ADDRESS" | sed -r 's/(.+)\.onion/\1.local/g')
SANDBOX_LAN_ADDRESS=$(echo "$SANDBOX_TOR_ADDRESS" | sed -r 's/(.+)\.onion/\1.local/g')

if [ "$(yq ".use-tor-instead-of-lan" /cryptpad/main/start9/config.yaml)" = "true" ]; then
  CPAD_MAIN_DOMAIN="$TOR_ADDRESS"
  CPAD_SANDBOX_DOMAIN="$SANDBOX_TOR_ADDRESS"
  PROTOCOL=http
else
  CPAD_MAIN_DOMAIN="$LAN_ADDRESS"
  CPAD_SANDBOX_DOMAIN="$SANDBOX_LAN_ADDRESS"
  PROTOCOL=https
fi

cp /cryptpad/config/config.example.js  /cryptpad/config/config.js

sed -i  -e "s@\(httpUnsafeOrigin:\).*[^,]@\1 '$PROTOCOL://$CPAD_MAIN_DOMAIN'@" \
        -e "s@\(^ *\).*\(httpSafeOrigin:\).*[^,]@\1\2 '$PROTOCOL://$CPAD_SANDBOX_DOMAIN'@" /cryptpad/config/config.js

exec tini npm start
