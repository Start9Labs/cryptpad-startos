# Multistage build to reduce image size and increase security
FROM node:16-alpine AS build

# Install requirements to clone repository and install deps
RUN apk add --no-cache git
RUN npm install -g bower

COPY ./.git /cryptpad-wrapper/.git
COPY ./cryptpad-docker /cryptpad-wrapper/cryptpad-docker

WORKDIR /cryptpad-wrapper/cryptpad-docker/cryptpad

RUN sed -i "s@//httpAddress: '::'@httpAddress: '0.0.0.0'@" /cryptpad-wrapper/cryptpad-docker/cryptpad/config/config.example.js
RUN sed -i "s@installMethod: 'unspecified'@installMethod: 'docker-alpine'@" /cryptpad-wrapper/cryptpad-docker/cryptpad/config/config.example.js

# Install dependencies
RUN npm install --production \
    && npm install -g bower \
    && bower install --allow-root

# Create actual cryptpad image
FROM node:16-alpine

RUN apk add --no-cache bash curl tini
RUN wget https://github.com/mikefarah/yq/releases/download/v4.25.3/yq_linux_arm.tar.gz -O - |\
    tar xz && mv yq_linux_arm /usr/bin/yq

# Create user and group for cryptpad so it does not run as root
# RUN addgroup -g 4001 -S cryptpad \
#     && adduser -u 4001 -S -D -g 4001 -H -h /cryptpad cryptpad

# Copy cryptpad with installed modules
COPY --from=build --chown=cryptpad /cryptpad-wrapper/cryptpad-docker/cryptpad /cryptpad
# COPY cryptpad-docker/cryptpad/docs/example.nginx.conf /etc/nginx/nginx.conf

# entrypoint
ADD docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh

# health check
ADD ./check-web.sh /usr/local/bin/check-web.sh
RUN chmod +x /usr/local/bin/check-web.sh

# Set workdir to cryptpad
WORKDIR /cryptpad

# Create directories
# RUN mkdir blob block customize data datastore
