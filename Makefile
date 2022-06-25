ASSETS := $(shell yq e '.assets.[].src' manifest.yaml)
ASSET_PATHS := $(addprefix assets/,$(ASSETS))
VERSION := $(shell yq e ".version" manifest.yaml)
# CRYPTPAD_SRC := $(shell find ./cryptpad/src) cryptpad/Cargo.toml cryptpad/Cargo.lock
S9PK_PATH=$(shell find . -name cryptpad.s9pk -print)

# delete the target of a rule if it has changed and its recipe exits with a nonzero exit status
.DELETE_ON_ERROR:

all: verify

verify: cryptpad.s9pk $(S9PK_PATH)
	embassy-sdk verify s9pk $(S9PK_PATH)

clean:
	rm -f image.tar
	rm -f cryptpad.s9pk

cryptpad.s9pk: manifest.yaml assets/compat/config_spec.yaml assets/compat/config_rules.yaml icon.png image.tar instructions.md $(ASSET_PATHS)
	embassy-sdk pack

image.tar: Dockerfile docker_entrypoint.sh check-web.sh
   DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/cryptpad/main:$(VERSION) --platform=linux/arm64 -o type=docker,dest=image.tar .
# DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/cryptpad/main:$(VERSION) --platform=linux/arm64 -o type=docker,dest=image.tar -f Dockerfile-alpine .
