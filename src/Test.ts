import * as vscode from 'vscode';
import { readFileSync, appendFile } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
// eslint-disable-next-line @typescript-eslint/naming-convention
import * as child_process from 'child_process';
import * as os from 'os';
import * as jsyaml from 'js-yaml';

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
            console.log("testSummaryList before splice", testSummaryList , "isCompleteSummary", isCompleteSummary);
            testSummaryList.splice(0, 6);
        console.log("testSummaryList", testSummaryList , "isCompleteSummary", isCompleteSummary);
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

interface TestCase {
    kind: string;
    name: string;
    status: string;
    started: number;
    completed: number;
    test_case_path: string;
    mock_path: string;
    test_case_id: string;
    req: {
        method: string;
        proto_major: number;
        proto_minor: number;
        url: string;
        header: Record<string, string>;
        body: string;
        timestamp: string;
    };
    resp: {
        status_code: number;
        header: Record<string, string>;
        body: string;
        status_message: string;
        proto_major: number;
        proto_minor: number;
        timestamp: string;
    };
    noise: Record<string, any>;
    result: {
        status_code: Record<string, any>;
        headers_result: Array<Record<string, any>>;
        body_result: Array<Record<string, any>>;
        dep_result: Array<any>;
    };
}


interface TestReport {
    version: string;
    name: string;
    status: string;
    success: number;
    failure: number;
    total: number;
    tests: {
        kind: string;
        name: string;
        status: string;
        started: number;
        completed: number;
        test_case_path: string;
        mock_path: string;
        test_case_id: string;
        req: {
            method: string;
            proto_major: number;
            proto_minor: number;
            url: string;
            header: Record<string, string>;
            body: string;
            timestamp: string;
        };
        resp: {
            status_code: number;
            header: Record<string, string>;
            body: string;
            status_message: string;
            proto_major: number;
            proto_minor: number;
            timestamp: string;
        };
        noise: Record<string, any[]>;
        result: {
            status_code: { normal: boolean; expected: number; actual: number };
            headers_result: { normal: boolean; expected: { key: string; value: string[] }; actual: { key: string; value: string[] } }[];
            body_result: { normal: boolean; type: string; expected: string; actual: string }[];
            dep_result: any[];
        };
    }[];
    test_set: string;
}

export async function displayPreviousTestResults(webview: any): Promise<void> {
    console.log('Displaying previous test results');
    try {
        const reportsFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath + '/keploy/reports';

        if (!fs.existsSync(reportsFolder)) {
            webview.postMessage({
                type: 'aggregatedTestResults',
                data: { success: 0, failure: 0, total: 0 },
                error: true,
                value: 'Run keploy test to generate test reports.'
            });
            return;
        }

        const testRunDirs = fs.readdirSync(reportsFolder).filter(dir =>
            fs.statSync(path.join(reportsFolder, dir)).isDirectory()
        );

        if (testRunDirs.length === 0) {
            webview.postMessage({
                type: 'aggregatedTestResults',
                data: { success: 0, failure: 0, total: 0 },
                error: true,
                value: 'Run keploy test to generate test reports.'
            });
            return;
        }

        // Sort directories to find the latest test run by date in opposite order
        testRunDirs.sort((a, b) => {
            const aTime = fs.statSync(path.join(reportsFolder, a)).birthtime.getTime();
            const bTime = fs.statSync(path.join(reportsFolder, b)).birthtime.getTime();
            return bTime - aTime;
        });
        // console.log('Test Run Dirs:', testRunDirs);

        let totalSuccess = 0;
        let totalFailure = 0;
        let totalTests = 0;

        const testResults: { date: string; method: string; name: string; status: string , testCasePath : string }[] = [];

        for (const testRunDir of testRunDirs) {
            const testRunPath = path.join(reportsFolder, testRunDir);
            const testFiles = fs.readdirSync(testRunPath).filter(file =>
                file.startsWith('test-set-') && file.endsWith('-report.yaml')
            );

            for (const testFile of testFiles) {
                const testFilePath = path.join(testRunPath, testFile);
                const fileContents = fs.readFileSync(testFilePath, 'utf8');
                const report: TestReport = jsyaml.load(fileContents) as TestReport;

                totalSuccess += report.success;
                totalFailure += report.failure;
                totalTests += report.total;

                if (report.tests) {
                    report.tests.forEach(test => {
                        testResults.push({
                            date: new Date(test.resp.header.Date).toLocaleDateString('en-GB'),
                            method: test.req.method,
                            name: test.test_case_id,
                            status: test.status,
                            testCasePath: testFilePath
                        });
                    });
                }
            }
        }

        const aggregatedResults = {
            success: totalSuccess,
            failure: totalFailure,
            total: totalTests,
            testResults
        };

        console.log('Aggregated Results:', aggregatedResults);
        // Send the aggregated results to the webview
        webview.postMessage({ type: 'aggregatedTestResults', data: aggregatedResults });

    } catch (error: any) {
        console.log(error);
        webview.postMessage({
            type: 'aggregatedTestResults',
            data: { success: 0, failure: 0, total: 0 },
            error: true,
            value: 'Run keploy test to generate test reports.'
        });
    }
}



export async function startTesting(wslscriptPath: string, wsllogfilePath: string, bashScriptPath: string, zshScriptPath:string, logfilePath: string, webview: any): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let terminalPath: string;
                let currentShell ='';

                if (process.platform === 'win32') {
                    terminalPath = 'wsl.exe';
                } else {
                    terminalPath = '/bin/bash';
                    // Get the default shell for the current user
                    currentShell = process.env.SHELL || '';

                    if (!currentShell) {
                        // Fallback method if process.env.SHELL is not set
                        currentShell = child_process.execSync('echo $SHELL', { encoding: 'utf8' }).trim();
                    }

                    console.log(`Current default shell: ${currentShell}`);
                    //uncomment the below line if you want to use the default shell (for zsh test)
                    // terminalPath = currentShell;
                }
                console.log(`Terminal path: ${terminalPath}`);
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: terminalPath,
                });

                terminal.show();
                if (process.platform === 'win32') {
                    const testCmd = `${wslscriptPath}  "${wsllogfilePath}" ;exit 0  `;
                    terminal.sendText(testCmd);
                }
                else {
                    let testCmd: string;
                    if (currentShell.includes('zsh')) {
                        // Use a Zsh-specific script if needed
                        console.log('Using Zsh script');
                        //replace bashScriptPath with zshScriptPath for zsh
                        testCmd = `"${bashScriptPath}" "${logfilePath}"; exit 0`;
                    } else {
                        // Default to Bash script
                         testCmd = `"${bashScriptPath}" "${logfilePath}" ; exit 0`;
                    }
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
        vscode.window.activeTerminal?.dispose();
        return ;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}
