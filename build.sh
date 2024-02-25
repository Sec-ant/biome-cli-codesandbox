#!/usr/bin/env bash

source .env

BIOME_VERSION="${BIOME_TAG:5}"

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

source "$HOME/.cargo/env"

git clone --depth 1 --branch $BIOME_TAG https://github.com/biomejs/biome biome-src

cd biome-src

rustup target add x86_64-unknown-linux-gnu

RUSTFLAGS="-C strip=symbols" BIOME_VERSION=$BIOME_VERSION cargo build -p biome_cli --release --target x86_64-unknown-linux-gnu

cp target/x86_64-unknown-linux-gnu/release/biome ..

cd ..

rm -rf biome-src

npm pkg set version="${BIOME_VERSION}"

npm pkg set -j config.prerelease=$PRERELEASE

npm pkg set -j config.publish=$PUBLISH