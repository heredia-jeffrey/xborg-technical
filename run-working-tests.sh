#!/bin/bash
echo "Running working tests..."

echo "Running unit tests first..."
cd apps/api && yarn test
if [ $? -ne 0 ]; then
    echo "Unit tests failed!"
    exit 1
fi
cd ../..

echo "Running simple e2e tests (without server)..."
cd apps/client && yarn test:e2e:simple
E2E_RESULT=$?

echo "Test run completed!"
exit $E2E_RESULT 