#!/usr/bin/env bash

cd server-download-cli
bun run build
cd ../web 
bun run build
rm -rf ../server/WebUI
cp -r dist/ ../server/WebUI
cd ../server
bun run build