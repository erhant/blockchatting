#!/bin/bash

# Script to deploy all contracts to the given network

# Go to parent folder
cd "${0%/*}"/..

# Choose target network, localhost by default
TARGET_NETWORK=localhost
if [[ $# -eq 1 ]] ; then
  TARGET_NETWORK=$1
fi

# Iterate through deploy scripts (https://stackoverflow.com/a/9612560)
find ./scripts -name "*.deploy.ts" -print0 | while read -d $'\0' FILE
do
  npx hardhat run --network $TARGET_NETWORK $FILE
done