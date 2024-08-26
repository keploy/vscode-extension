#!/bin/bash

export API_KEY="1234"


sourceFilePath=$1
testFilePath=$2


# Add env variables to the npm test command
# utgEnv=" -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage"

# testCommand="npm test "+ $utgEnv


keploy gen --source-file-path="$sourceFilePath" \
  --test-file-path="$testFilePath" \
  --test-command="npm test -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage
" \
  --coverage-report-path="./coverage/cobertura-coverage.xml"\
 --llmApiVersion "2024-02-01" --llmBaseUrl "https://api.keploy.io" --max-iterations "10"

