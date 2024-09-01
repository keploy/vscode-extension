import * as vscode from 'vscode';
import { readFileSync, appendFile } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
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

        // Split the log data into lines
        const logLines = logData.split('\n');
        
        // Check if it's a Go test output
        if (logLines[0].startsWith('=== RUN')) {
            return processGoTestOutput(logLines, webview, isHomePage, isCompleteSummary);
        }

        // Existing logic for JS/TS test output
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

        const testSummary = logLines.slice(startIndex, endIndex + 1).join('\n');
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

        const ansiRegex = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        const cleanSummary = testSummary.replace(ansiRegex, '');
        console.log(cleanSummary);
        const testSummaryList = cleanSummary.split('\n');
        console.log(testSummaryList);
        testSummaryList.pop();
        testSummaryList.shift();

        if (isCompleteSummary) {
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

function processGoTestOutput(logLines: string[], webview: any, isHomePage: boolean, isCompleteSummary: boolean): void {
    let passed = 0;
    let failed = 0;
    let total = 0;
    const testResults: string[] = [];

    logLines.forEach(line => {
        if (line.startsWith('--- PASS:')) {
            passed++;
            total++;
            testResults.push(line);
        } else if (line.startsWith('--- FAIL:')) {
            failed++;
            total++;
            testResults.push(line);
        }
    });

    const summary = `Total: ${total}, Passed: ${passed}, Failed: ${failed}`;
    testResults.unshift(summary);

    if (isCompleteSummary) {
        testResults.forEach(line => {
            webview.postMessage({
                type: 'testResults',
                value: 'Test Summary Generated',
                textSummary: line,
                isHomePage: false,
                isCompleteSummary: true
            });
        });
    } else {
        testResults.slice(0, 3).forEach(line => {
            webview.postMessage({
                type: 'testResults',
                value: 'Test Summary Generated',
                textSummary: line,
                isHomePage: isHomePage,
                isCompleteSummary: false
            });
        });
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

        const testResults: { date: string; method: string; name: string; report: string; status: string , testCasePath : string }[] = [];

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
                            report : test.name,
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
                    currentShell = process.env.SHELL || '';
                    if (!currentShell) {
                        currentShell = child_process.execSync('echo $SHELL', { encoding: 'utf8' }).trim();
                    }
                    console.log(`Current default shell: ${currentShell}`);
                }
                console.log(`Terminal path: ${terminalPath}`);
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: terminalPath,
                });

                terminal.show();
                let testCmd: string;
                
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const document = editor.document;
                    const filePath = document.uri.fsPath;
                    if (filePath.endsWith('.go')) {
                        // For Go files
                        testCmd = `go test -v ${filePath} > "${logfilePath}"; exit 0`;
                    } else {
                        // For JS/TS files
                        if (process.platform === 'win32') {
                            testCmd = `${wslscriptPath}  "${wsllogfilePath}" ;exit 0  `;
                        } else {
                            if (currentShell.includes('zsh')) {
                                testCmd = `"${bashScriptPath}" "${logfilePath}"; exit 0`;
                            } else {
                                testCmd = `"${bashScriptPath}" "${logfilePath}" ; exit 0`;
                            }
                        }
                    }
                } else {
                    vscode.window.showErrorMessage('No active editor found');
                    reject(new Error('No active editor found'));
                    return;
                }

                terminal.sendText(testCmd);

                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose();
                        displayTestCases(logfilePath, webview, false, false);
                        resolve();
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
