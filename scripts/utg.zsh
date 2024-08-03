#!/bin/zsh

echo "Choose the type of test generation:"
echo "1. Single Test File"
echo "2. Entire Application"
read "choice?Enter the number corresponding to your choice: "

if [ "$choice" -eq 1 ]; then
    read "sourceFilePath?Enter the path to the source file: "
    read "testFilePath?Enter the path to the test file for the above source file: "
    read "coverageReportPath?Enter the path to the coverage report (coverage.xml): "
    
    keploy gen --sourceFilePath="$sourceFilePath" --testFilePath="$testFilePath" --testCommand="npm test" --coverageReportPath="$coverageReportPath"

elif [ "$choice" -eq 2 ]; then
    read "coverageReportPath?Enter the path to the coverage report (coverage.xml): "

    echo "⚠️ Warning: Executing this command will generate unit tests for all files in the application. Depending on the size of the codebase, this process may take between 20 minutes to an hour and will incur costs related to LLM usage."

    keploy gen --testCommand="npm test" --testDir="test" --coverageReportPath="$coverageReportPath"

else
    echo "Invalid choice. Please run the script again and choose either 1 or 2."
fi
