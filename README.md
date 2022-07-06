# Wrapper for CryptPad

`CryptPad` is a collaboration suite that is end-to-end-encrypted and open-source. It is built to enable collaboration, synchronizing changes to documents in real time. Because all data is encrypted, the service and its administrators have no way of seeing the content being edited and stored.

## Dependencies

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [yq](https://mikefarah.gitbook.io/yq)
- [embassy-sdk](https://github.com/Start9Labs/embassy-os/blob/master/backend/install-sdk.sh)
- [make](https://www.gnu.org/software/make/)

## Cloning

```
git clone https://github.com/chrisguida/cryptpad-wrapper.git
cd cryptpad-wrapper
git submodule update --init --recursive
```

## Building

```
make
```

## Sideload onto your Embassy

SSH into an Embassy device.
`scp` the `.s9pk` to any directory from your local machine.
Run the following command to determine successful install:

```
scp cryptpad.s9pk root@embassy-<id>.local:/embassy-data/package-data/tmp # Copy the S9PK to the external disk
ssh root@embassy-<id>.local
embassy-cli auth login
embassy-cli package install cryptpad.s9pk # Install the sideloaded package
```
