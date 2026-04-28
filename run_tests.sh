#!/bin/bash

# -------------------------
# CONFIG
# -------------------------
#LOCAL_WORKERS=4
HE_YAML="hyperexecute_playwright.yaml"
HYPEREXECUTE_CMD="sudo hyperexecute --user $LT_USERNAME --key $LT_ACCESS_KEY --config $HE_YAML"

# -------------------------
# FUNCTION: Run local tests
# -------------------------
run_local_tests() {
    echo "Running Playwright tests locally..."
    local start_time=$(date +%s)

    # Run tests with playwright test runner
    #npx playwright test --workers=$LOCAL_WORKERS --reporter=list
    npx playwright test --reporter=list

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo "Local test run completed in ${duration} seconds."
    echo $duration
    echo "-------------------------------------"
}

# -------------------------
# FUNCTION: Run HyperExecute tests
# -------------------------
run_hyperexecute_tests() {
    echo "Running Playwright tests on HyperExecute..."
    local start_time=$(date +%s)

    # Trigger HyperExecute run
    $HYPEREXECUTE_CMD
    if [ $? -ne 0 ]; then
        echo "HyperExecute job failed!"
        return
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo "HyperExecute run completed in ${duration} seconds."
    echo $duration
}

# -------------------------
# MAIN SCRIPT
# -------------------------
echo "-------------------------------------"
echo "Playwright Test Comparison: Local vs HyperExecute"
echo "-------------------------------------"

local_time=$(run_local_tests)
he_time=$(run_hyperexecute_tests)

echo "-------------------------------------"
echo "Total Run Time Comparison"
echo "Local Playwright Run Time: ${local_time} seconds"
echo "HyperExecute Run Time:    ${he_time} seconds"
echo "-------------------------------------"
