#!/usr/bin/env bash

echo "====================="
echo "Updating dependencies"
echo "====================="
echo ""
echo "Extension"
echo "========="
cd extension
bun update
echo ""
echo "Server"
echo "======"
cd ../server 
bun update
echo ""
echo "Server Download Cli"
echo "==================="
cd ../server-download-cli
bun update
echo ""
echo "Web"
echo "==="
cd ../web 
bun update