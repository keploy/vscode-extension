#!/bin/bash

export API_KEY="1234"

sourceFilePath=$1
testFilePath=$2

# Function to run Go tests
run_go_tests() {
    local sourcePath=$1
    local testPath=$2
    
    # Ensure the test file exists
    if [ ! -f "$testPath" ]; then
        echo "// Test file for $(basename $sourcePath)" > "$testPath"
    fi

    # Run Go tests with coverage
    go test -v -coverprofile=coverage.out "$sourcePath"
    
    # Convert coverage to HTML (optional, but useful for visualization)
    go tool cover -html=coverage.out -o ./coverage/coverage.html

    # Convert coverage to Cobertura XML format for compatibility
    go-cover-treemap -coverprofile coverage.out -o ./coverage/cobertura-coverage.xml
}

# Check if the source file is a Go file
if [[ "$sourceFilePath" == *.go ]]; then
    # For Go files
    testFilePath="${sourceFilePath%.*}_test.go"
    run_go_tests "$sourceFilePath" "$testFilePath"
else
    # For JavaScript/TypeScript files
    # Add env variables to the npm test command
    utgEnv=" -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage"

    testCommand="npm test $utgEnv"

    keploy gen --source-file-path="$sourceFilePath" \
      --test-file-path="$testFilePath" \
      --test-command="$testCommand" \
      --coverage-report-path="./coverage/cobertura-coverage.xml"\
      --llmApiVersion "2024-02-01" --llmBaseUrl "https://api.keploy.io" --max-iterations "10"
fi

