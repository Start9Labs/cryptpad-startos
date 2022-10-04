VERSION := $(shell yq e ".version" manifest.yaml)
TS_FILES := $(shell find ./ -name \*.ts)

# delete the target of a rule if it has changed and its recipe exits with a nonzero exit status
.DELETE_ON_ERROR:

all: verify

install: all
	embassy-cli package install cryptpad.s9pk

verify: cryptpad.s9pk
	embassy-sdk verify s9pk cryptpad.s9pk

clean:
	rm -f image.tar
	rm -f cryptpad.s9pk

cryptpad.s9pk: manifest.yaml assets/compat/* icon.png image.tar instructions.md scripts/embassy.js
	embassy-sdk pack

image.tar: Dockerfile docker_entrypoint.sh check-web.sh
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/cryptpad/main:$(VERSION) --platform=linux/arm64 -o type=docker,dest=image.tar .

scripts/embassy.js: $(TS_FILES)
	deno bundle scripts/embassy.ts scripts/embassy.js
