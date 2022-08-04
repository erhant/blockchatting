#!/bin/bash
## Script to duplicate typechain types to a specified path.

# Go to parent folder
cd "${0%/*}"/..

# Specify target
TARGET='../frontend'

### Migrate Types ###
# Clean types there
rm -rf $TARGET/types/typechain

# Copy the new ones
cp -r ./types/typechain $TARGET/types/

### Migrate Constants ###
# Clean contract constants there
rm -f $TARGET/constants/contract.ts

# Copy the new ones
DEST_CONSTANTS=$TARGET/constants/
cp ./constants/contract.ts $DEST_CONSTANTS

echo -e "/// do not edit here, go to contracts folder!\n$(cat $DEST_CONSTANTS/contract.ts)" > $DEST_CONSTANTS/contract.ts