#!/bin/bash
# example: ./changeVersionToPublish.sh 1.0.0

version=$(node -p -e "require('./package.json').version")

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/securitytoken-sdk\": \".*\"/\"@hashgraph\/securitytoken-sdk\": \"$version\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i '' "s/\"@hashgraph\/securitytoken-contracts\": \".*\"/\"@hashgraph\/securitytoken-contracts\": \"$version\"/g" 
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/securitytoken-sdk\": \".*\"/\"@hashgraph\/securitytoken-sdk\": \"$version\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/securitytoken-contracts\": \".*\"/\"@hashgraph\/securitytoken-contracts\": \"$version\"/g" 
elif [[ "$OSTYPE" == "msys" ]]; then
  # Windows
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/securitytoken-sdk\": \".*\"/\"@hashgraph\/securitytoken-sdk\": \"$version\"/g"
  find . -path ./node_modules -prune -o -name "package.json" -type f  | grep -v node_modules | grep -v example | xargs sed -i "s/\"@hashgraph\/securitytoken-contracts\": \".*\"/\"@hashgraph\/securitytoken-contracts\": \"$version\"/g" 
fi