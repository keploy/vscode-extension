#!/bin/bash

export API_KEY="1234"


sourceFilePath=$1
testFilePath=$2
coverageReportPath=$3

echo "Generating tests for source file: $sourceFilePath"
echo "Using test file: $testFilePath"
echo "Coverage report path: $coverageReportPath"

# Add env variables to the npm test command
utgEnv=" -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage"

testCommand="npm test "+ $utgEnv
echo $testCommand
# Run Keploy
# keploy gen --sourceFilePath="./src/routes/routes.js" --testFilePath="./test/routes.test.js" --testCommand=$testCommand  --coverageReportPath="$coverageReportPath" --llmApiVersion="2024-02-01" --llmBaseUrl="https://keploy-open-ai-instance.openai.azure.com/openai/deployments/Keploy-gpt4o" --max-iterations="10"

keploy gen --source-file-path="$sourceFilePath" \
  --test-file-path="$testFilePath" \
  --test-command="npm test -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage
" \
  --coverage-report-path="./coverage/cobertura-coverage.xml"\
 --llmApiVersion "2024-02-01" --llmBaseUrl "https://api.keploy.io" --max-iterations "10" --debug

