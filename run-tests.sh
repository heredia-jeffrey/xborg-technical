#!/bin/bash

echo "Starting test sequence..."

echo "Starting client server..."
cd apps/client && yarn dev &
CLIENT_PID=$!

echo "Starting API server..."
cd ../api && yarn dev &
API_PID=$!

echo "Waiting for servers to start (15 seconds)..."
sleep 15

echo "Running tests..."
cd ../client && npx playwright test --timeout=90000 --reporter=list

echo "Tests completed, shutting down servers..."
kill $CLIENT_PID
kill $API_PID

echo "Done!" 