import * as vscode from 'vscode';
import { readFileSync, appendFile } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export async function displayTestCases(logfilePath: string, webview: any, isHomePage: boolean, isCompleteSummary: boolean): Promise<void> {
    console.log('Displaying test cases');
    let logData;
    try {
        try {
            logData = readFileSync(logfilePath, 'utf8');
        }
        catch (error) {
            appendFile(logfilePath, "", function (err) {
                if (err) { console.log("err here " + err); }
            });
            logData = readFileSync(logfilePath, 'utf8');
        }
        // console.log(logData);
        // Split the log data into lines
        const logLines = logData.split('\n');
        // Filter out the lines containing the desired information
        // Find the index of the line containing the start of the desired part
        const startIndex = logLines.findIndex(line => line.includes('COMPLETE TESTRUN SUMMARY.'));
        if (startIndex === -1) {
            console.log('Start index not found');
            webview.postMessage({
                type: 'testResults',
                value: 'Test Failed',
                textSummary: "Error Replaying Test Cases. Please try again.",
                error: true,
                isHomePage: isHomePage,
                isCompleteSummary: isCompleteSummary
            });
            return;
        }

        // Find the index of the line containing the end of the desired part
        const endIndex = logLines.findIndex((line, index) => index > startIndex && line.includes('<=========================================>'));
        if (endIndex === -1) {
            console.log('End index not found');
            webview.postMessage({
                type: 'testResults',
                value: 'Test Failed',
                textSummary: "Error Replaying Test Cases. Please try again.",
                error: true,
                isHomePage: isHomePage,
                isCompleteSummary: isCompleteSummary
            });
            return;
        }

        // Extract the desired part
        const testSummary = logLines.slice(startIndex, endIndex + 1).join('\n');
        // Display the captured test cases in your frontend
        if (testSummary.length === 0) {
            webview.postMessage({
                type: 'testResults',
                value: 'Test Failed',
                textSummary: "Error Replaying Test Cases. Please try again.",
                error: true,
                isHomePage: isHomePage,
                isCompleteSummary: isCompleteSummary
            });
            return;
        }
        //remove ansi escape codes
        const ansiRegex = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        const cleanSummary = testSummary.replace(ansiRegex, '');
        console.log(cleanSummary);
        const testSummaryList = cleanSummary.split('\n');
        console.log(testSummaryList);
        //remove last line of summary which is pattern
        testSummaryList.pop();
        //remove first line of summary which is header
        testSummaryList.shift();


        if (isCompleteSummary) {
            //remove fist 7 lines of summary
            testSummaryList.splice(0, 7);
            testSummaryList.forEach((line, index) => {
                webview.postMessage({
                    type: 'testResults',
                    value: 'Test Summary Generated',
                    textSummary: line,
                    isHomePage: false,
                    isCompleteSummary: isCompleteSummary
                });
            });
        }
        else {
        //send first three lines of summary
            testSummaryList.forEach((line, index) => {
                if (index > 2) {
                    return;
                }
                webview.postMessage({
                    type: 'testResults',
                    value: 'Test Summary Generated',
                    textSummary: line,
                    isHomePage: isHomePage,
                    isCompleteSummary: isCompleteSummary
                });
            });
        }
    }
    catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy Test: ' + error);
        throw error;
    }
}



export async function displayPreviousTestResults(webview: any): Promise<void> {
    console.log('Displaying previous test results');
    try {
        const reportsFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath + '/keploy/reports';

        if (!fs.existsSync(reportsFolder)) {
            webview.postMessage({ type: 'aggregatedTestResults', data: { success: 0, failure: 0, total: 0 } , error: true , value : 'Run keploy test to generate test reports.'});
            // throw new Error('Reports directory does not exist');
        }

        const testRunDirs = fs.readdirSync(reportsFolder).filter(dir => 
            fs.statSync(path.join(reportsFolder, dir)).isDirectory());

        if (testRunDirs.length === 0) {
            webview.postMessage({ type: 'aggregatedTestResults', data: { success: 0, failure: 0, total: 0 } , error: true , value : 'Run keploy test to generate test reports.'});
            // throw new Error('No test run directories found');

        }

        // Sort directories to find the latest test run
        testRunDirs.sort((a, b) => parseInt(b.split('-').pop()!) - parseInt(a.split('-').pop()!));
        const latestTestRunDir = testRunDirs[0];
        const latestTestRunPath = path.join(reportsFolder, latestTestRunDir);

        console.log(`Reading reports from the latest test run directory: ${latestTestRunDir}`);

        const testFiles = fs.readdirSync(latestTestRunPath).filter(file => 
            file.startsWith('test-set-') && file.endsWith('-report.yaml'));

        let totalSuccess = 0;
        let totalFailure = 0;
        let totalTests = 0;

        for (const testFile of testFiles) {
            const testFilePath = path.join(latestTestRunPath, testFile);
            const fileContents = fs.readFileSync(testFilePath, 'utf8');
            const report = yaml.parse(fileContents);

            totalSuccess += report.success;
            totalFailure += report.failure;
            totalTests += report.total;
        }

        const aggregatedResults = {
            success: totalSuccess,
            failure: totalFailure,
            total: totalTests
        };

        console.log('Aggregated Results:', aggregatedResults);
        // You can also pass this to the webview or process it further as needed
        webview.postMessage({ type: 'aggregatedTestResults', data: aggregatedResults });

    } catch (error : any) {
        console.log(error);
        webview.postMessage({ type: 'aggregatedTestResults', data: { success: 0, failure: 0, total: 0 } , error: true , value : 'Run keploy test to generate test reports.'});

    }   
}

export async function startTesting(command: string, folderPath: string,generatedTestCommand:string, wslscriptPath: string, wsllogfilePath: string, scriptPath: string, logfilePath: string, webview: any): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let bashPath: string;
                if (process.platform === 'win32') {
                    bashPath = 'wsl.exe';
                } else {
                    bashPath = '/bin/bash';
                }
                //remove keploy from the command
                // generatedTestCommand = generatedTestCommand.replace('keploy', '');
                // command = "test -c" + command;

                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: bashPath,
                });

                terminal.show();
                if (process.platform === 'win32') {
                    const testCmd = `${wslscriptPath}  "${wsllogfilePath}" "${folderPath}" "${command}" ;exit 0  `;
                    terminal.sendText(testCmd);
                }
                else {
                    const testCmd = `"${scriptPath}" "${logfilePath}" "${folderPath}" "${command}" ; exit 0 `;
                    // const exitCmd = 'exit';
                    terminal.sendText(testCmd);
                }
                // terminal.sendText('exit', true);

                // Listen for terminal close event
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose(); // Dispose the listener
                        displayTestCases(logfilePath, webview, false, false); // Call function when terminal is closed
                        resolve(); // Resolve the promise
                    }
                });

            } catch (error) {
                console.log("error is " + error);
                vscode.window.showErrorMessage('Error occurred Keploy Test: ' + error);
                reject(error);
            }
        });
    }
    catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy Test: ' + error);
        throw error;
    }
}

export async function stopTesting(): Promise<void> {
    try {
        vscode.window.activeTerminal?.sendText('\x03', true);
        //set timeout for 5 seconds
        setTimeout(() => {
            vscode.window.activeTerminal?.dispose();
        }, 5000);
        return ;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}
