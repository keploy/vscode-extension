#!/bin/bash

echo "Choose the type of test generation:"
echo "1. Single Test File"
echo "2. Entire Application"
read -p "Enter the number corresponding to your choice: " choice

if [ "$choice" -eq 1 ]; then
    read -p "Enter the path to the source file: " sourceFilePath
    read -p "Enter the path to the test file for the above source file: " testFilePath
    read -p "Enter the path to the coverage report (coverage.xml): " coverageReportPath
    
    keploy gen --sourceFilePath="$sourceFilePath" --testFilePath="$testFilePath" --testCommand="npm test" --coverageReportPath="$coverageReportPath"

elif [ "$choice" -eq 2 ]; then
    read -p "Enter the path to the coverage report (coverage.xml): " coverageReportPath

    echo "⚠️ Warning: Executing this command will generate unit tests for all files in the application. Depending on the size of the codebase, this process may take between 20 minutes to an hour and will incur costs related to LLM usage."

    keploy gen --testCommand="npm test" --testDir="test" --coverageReportPath="$coverageReportPath"

else
    echo "Invalid choice. Please run the script again and choose either 1 or 2."
fi
