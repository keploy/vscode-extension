#!/bin/bash

export API_KEY="1234"

sourceFilePath=$1
testFilePath=$2
coverageReportPath=$3
command=$4
additional_prompts=$5
CodeLensefunctionName=$6
# Get the file extension
extension="${sourceFilePath##*.}"

# If the file is a Python file, install pytest-cov
if [ "$extension" = "py" ]; then
  echo "Checking if pytest is installed..."
  
  # Check if pytest is installed
  if ! pip3 show pytest > /dev/null 2>&1; then
    echo "pytest is not installed. Installing pytest..."
    pip3 install pytest --break-system-packages
  else
    echo "pytest is already installed."
  fi

  echo "Checking if pytest-cov is installed..."
  
  # Check if pytest-cov is installed
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

if [ "$extension" = "rs" ]; then
  echo "Setting up Rust testing environment..."
  
  # Check if rustup is installed
  if ! command -v rustup &> /dev/null; then
    echo "rustup is not installed. Please install Rust toolchain first."
    exit 1
  fi
  
  # Check if cargo-llvm-cov is installed
  if ! cargo install --list | grep -q "cargo-llvm-cov"; then
    echo "Installing cargo-llvm-cov..."
    cargo install cargo-llvm-cov
  else
    echo "cargo-llvm-cov is already installed."
  fi
  
  # Check if the project has a Cargo.toml file
  if [ ! -f "Cargo.toml" ]; then
    echo "No Cargo.toml found. Please ensure you're in a Rust project directory."
    exit 1
  fi
  
  # Install llvm-tools-preview component if not already installed
  rustup component add llvm-tools-preview
  
  # Set default test command if none provided
  if [ -z "$command" ]; then
    command="cargo llvm-cov --html --output-dir \"$coverageReportPath\""
  fi
fi

# Construct the keploy gen command
if [ "$extension" = "java" ]; then
  keployCommand="keploy gen --source-file-path=\"$sourceFilePath\" \
    --test-file-path=\"$testFilePath\" \
    --test-command=\"$command\" \
    --coverage-report-path=\"$coverageReportPath\" \
    --llmApiVersion \"2024-02-01\" \
    --llmBaseUrl \"https://api.keploy.io\" \
    --max-iterations \"5\" \
    --coverageFormat jacoco"
elif [ "$extension" = "rs" ]; then
  keployCommand="keploy gen --source-file-path=\"$sourceFilePath\" \
    --test-file-path=\"$testFilePath\" \
    --test-command=\"$command\" \
    --coverage-report-path=\"$coverageReportPath\" \
    --llmApiVersion \"2024-02-01\" \
    --llmBaseUrl \"https://api.keploy.io\" \
    --max-iterations \"5\" \
    --coverageFormat lcov"
else
  keployCommand="keploy gen --source-file-path=\"$sourceFilePath\" \
    --test-file-path=\"$testFilePath\" \
    --test-command=\"$command\" \
    --coverage-report-path=\"$coverageReportPath\" \
    --llmApiVersion \"2024-02-01\" \
    --llmBaseUrl \"https://api.keploy.io\" \
    --max-iterations \"5\" \
    --coverageFormat cobertura"
fi

# Add the additional prompt if it's provided and not an empty string
if [ -n "$additional_prompts" ] && [ "$additional_prompts" != " " ]; then
  keployCommand="$keployCommand --additional-prompt \"$additional_prompts\""
fi

if [ -n "$CodeLensefunctionName" ] && [ "$CodeLensefunctionName" != " " ]; then
  keployCommand="$keployCommand --function-under-test \"$CodeLensefunctionName\""
fi

# Run the keploy command
eval $keployCommand