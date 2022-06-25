# Multistage build to reduce image size and increase security

FROM node:16-alpine AS build

# Install requirements to clone repository and install deps
RUN apk add --no-cache git \
    && npm install -g bower

# Get cryptpad from repository submodule
COPY cryptpad-docker/cryptpad /cryptpad

WORKDIR /cryptpad

# Install dependencies
RUN npm install --production \
    && npm install -g bower \
    && bower install --allow-root

# Create actual cryptpad image
FROM node:16-alpine



RUN set -x \
    # Create users and groups for nginx and cryptpad
    && addgroup -g 4001 -S cryptpad \
    && adduser -u 4001 -S -D -G cryptpad -H -h /dev/null cryptpad \
    \
    # Create needed dir for nginx pid
    && mkdir -p /var/run/nginx \
    \
    # Install packages
    && apk add supervisor nginx openssl zlib pcre \
    && rm -rf /etc/nginx

# Copy nginx conf from official image
COPY --from=nginx:latest /etc/nginx /etc/nginx

# Disable server tokens
RUN sed -i "/default_type/a \\    server_tokens off;" /etc/nginx/nginx.conf

# Copy cryptpad with installed modules
COPY --from=build --chown=cryptpad /cryptpad /cryptpad

# Copy supervisord conf file
COPY cryptpad-docker/supervisord.conf /etc/supervisord.conf

# Copy docker-entrypoint.sh script
COPY cryptpad-docker/docker-entrypoint.sh /docker-entrypoint.sh

# Set workdir to cryptpad
WORKDIR /cryptpad

# Create directories
RUN mkdir blob block customize data datastore \
    && chown cryptpad:cryptpad blob block customize data datastore

# Volumes for data persistence
# VOLUME /cryptpad/blob \
#        /cryptpad/block \
#        /cryptpad/customize \
#        /cryptpad/data \
#        /cryptpad/datastore

# # Ports
# EXPOSE 80 443

# ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]

# CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]

# entrypoint
ADD docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod +x /usr/local/bin/docker_entrypoint.sh
# RUN chown cryptpad /usr/local/bin/docker_entrypoint.sh

# health check
ADD ./check-web.sh /usr/local/bin/check-web.sh
RUN chmod +x /usr/local/bin/check-web.sh
# RUN chown cryptpad /usr/local/bin/check-web.sh