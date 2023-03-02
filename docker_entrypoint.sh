#!/bin/bash

set -e

CPAD_CONF=/cryptpad/config/config.js
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

cp /cryptpad/config/config.example.js $CPAD_CONF

sed -i  -e "s@\(httpUnsafeOrigin:\).*[^,]@\1 '$PROTOCOL://$CPAD_MAIN_DOMAIN'@" \
        -e "s@\(^ *\).*\(httpSafeOrigin:\).*[^,]@\1\2 '$PROTOCOL://$CPAD_SANDBOX_DOMAIN'@" $CPAD_CONF
# sed -i  -e "s~\(adminEmail:\).*[^,]~\1 '$CPAD_ADMIN_EMAIL'~" -e '/^ *adminEmail.*/a\ \ \ \ adminKeys: ' $CPAD_CONF
# sed -i  -e "s~\(adminKeys:\).*[^,]~\1 '$CPAD_ADMIN_EMAIL'~" $CPAD_CONF
sed -i 's#cpad_main_domain#'$CPAD_MAIN_DOMAIN'#g' /etc/nginx/http.d/cryptpad.conf
sed -i 's#cpad_sandbox_domain#'$CPAD_SANDBOX_DOMAIN'#g' /etc/nginx/http.d/cryptpad.conf

if yq -e '.admin-public-key' /cryptpad/main/start9/config.yaml > /dev/null 2>&1; then
  ADMIN_PUBLIC_KEY=$(yq e '.admin-public-key' /cryptpad/main/start9/config.yaml)
  sed -i -e '/^ *installMethod.*/a\ \ \ \ adminKeys: ,' $CPAD_CONF
  sed -i "s~\(adminKeys:\).*[^,]~\1 \\[\ \"$ADMIN_PUBLIC_KEY\",\ \]~" $CPAD_CONF
fi

if yq -e '.admin-email' /cryptpad/main/start9/config.yaml > /dev/null 2>&1; then
  ADMIN_EMAIL=$(yq e '.admin-email' /cryptpad/main/start9/config.yaml)
  sed -i -e '/^ *installMethod.*/a\ \ \ \ adminEmail: ,' $CPAD_CONF
  sed -i "s~\(adminEmail:\).*[^,]~\1 '$ADMIN_EMAIL'~" $CPAD_CONF
fi

if yq -e '.max-upload-size' /cryptpad/main/start9/config.yaml > /dev/null 2>&1; then
  MAX_UPLOAD_SIZE=$(yq e '.max-upload-size' /cryptpad/main/start9/config.yaml)
  sed -i -e '/^ *installMethod.*/a\ \ \ \ maxUploadSize: ,' $CPAD_CONF
  sed -i "s~\(maxUploadSize:\).*[^,]~\1 $MAX_UPLOAD_SIZE * 1024 * 1024~" $CPAD_CONF
fi
nginx
exec tini npm start
