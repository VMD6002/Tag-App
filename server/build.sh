#!/usr/bin/env bash

rm -rf dist
bun build src/index.ts --outfile dist/index.js --target node
cp -r WebUI/ dist/
mkdir dist/Download
cp Download/index.js dist/Download/