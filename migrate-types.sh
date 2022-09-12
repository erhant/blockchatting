#!/bin/bash
## Script to duplicate typechain types to a specified path.

# Go to pwd
cd "${0%/*}"

SOURCE='./contracts/types/typechain'
DESTINATION='./frontend/types/typechain'

### Migrate Types ###
# Clean types there
rm -rf $DESTINATION

# Copy the new ones
cp -r $SOURCE $DESTINATION