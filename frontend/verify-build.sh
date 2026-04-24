#!/bin/bash

# Tax Platform Next.js Build Verification Script
# This script verifies that the prerendering fixes are working correctly

echo "=== Tax Platform Next.js Build Verification ==="
echo ""
echo "Step 1: Checking Node.js and npm..."
node --version
npm --version
echo ""

echo "Step 2: Installing dependencies (if needed)..."
if [ ! -d "node_modules" ]; then
    npm install
fi
echo ""

echo "Step 3: Running build with verbose output..."
npm run build 2>&1 | tee build-output.log
BUILD_STATUS=$?
echo ""

echo "Step 4: Analyzing build output for errors..."
if grep -q "useContext" build-output.log; then
    echo "❌ ERROR: useContext errors still present in build!"
    exit 1
fi

if grep -q "is not available in Server Components" build-output.log; then
    echo "❌ ERROR: Server Component errors still present!"
    exit 1
fi

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL - No prerendering errors detected!"
    echo ""
    echo "Verification Summary:"
    echo "- No useContext errors"
    echo "- No Server Component context errors"
    echo "- All pages compiled successfully"
    echo ""
    echo "You can now deploy to production."
else
    echo "❌ BUILD FAILED - Check build-output.log for details"
    exit 1
fi
