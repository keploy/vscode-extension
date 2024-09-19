#!/bin/bash

export API_KEY="1234"


sourceFilePath=$1
testFilePath=$2
coverageReportPath=$3
command=$4


# Get the file extension
extension="${sourceFilePath##*.}"

# If the file is a Python file, install pytest-cov
if [ "$extension" = "py" ]; then
  echo "Checking if pytest-cov is installed..."
  if ! pip3 show pytest-cov > /dev/null 2>&1; then
    echo "pytest-cov is not installed. Installing pytest-cov..."
    pip3 install pytest-cov --break-system-packages
  else
    echo "pytest-cov is already installed."
  fi
fi

if [ "$extension" = "js" ] || [ "$extension" = "ts" ]; then
  echo "Checking if Jest is installed..."
  if ! npm list -g jest > /dev/null 2>&1; then
    echo "Jest is not installed. Installing Jest..."
    npm install --global jest 
  else
    echo "Jest is already installed."
  fi
fi

if [ "$extension" = "go" ]; then
  echo "Installing Go coverage tools..."
  go install github.com/axw/gocov/gocov@v1.1.0
  go install github.com/AlekSi/gocov-xml@v1.1.0
  export PATH=$PATH:$(go env GOPATH)/bin
fi

# Add env variables to the npm test command
# utgEnv=" -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage"

# Construct the keploy gen command
if [ "$extension" = "java" ]; then
  keploy gen --source-file-path="$sourceFilePath" \
    --test-file-path="$testFilePath" \
    --test-command="$command" \
    --coverage-report-path="$coverageReportPath" \
    --llmApiVersion "2024-02-01" \
    --llmBaseUrl "https://api.keploy.io" \
    --max-iterations "5" \
    --coverageFormat jacoco
else
  keploy gen --source-file-path="$sourceFilePath" \
    --test-file-path="$testFilePath" \
    --test-command="$command" \
    --coverage-report-path="$coverageReportPath" \
    --llmApiVersion "2024-02-01" \
    --llmBaseUrl "https://api.keploy.io" \
    --max-iterations "5" \
    --coverageFormat cobertura
fi