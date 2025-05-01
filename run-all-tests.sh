#!/bin/bash
echo "Running all tests..."

# Store the current directory
ORIGINAL_DIR=$(pwd)

echo "Running unit tests first..."
cd "$ORIGINAL_DIR/apps/api" && yarn test
if [ $? -ne 0 ]; then
    echo "Unit tests failed!"
    exit 1
fi

echo "Starting servers for E2E tests..."
echo "Starting client server..."
cd "$ORIGINAL_DIR/apps/client" && yarn dev &
CLIENT_PID=$!

echo "Starting API server..."
cd "$ORIGINAL_DIR/apps/api" && yarn dev &
API_PID=$!

echo "Waiting for servers to fully start (30 seconds)..."
sleep 30

echo "Running E2E tests..."
cd "$ORIGINAL_DIR/apps/client" && yarn test:e2e:no-server
E2E_RESULT=$?

echo "Tests completed, shutting down servers..."
kill $CLIENT_PID
kill $API_PID

echo "Test run completed!"
exit $E2E_RESULT 