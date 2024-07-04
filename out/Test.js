"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopTesting = exports.startTesting = exports.displayPreviousTestResults = exports.displayTestCases = void 0;
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// eslint-disable-next-line @typescript-eslint/naming-convention
const child_process = __importStar(require("child_process"));
const jsyaml = __importStar(require("js-yaml"));
function displayTestCases(logfilePath, webview, isHomePage, isCompleteSummary) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Displaying test cases');
        let logData;
        try {
            try {
                logData = (0, fs_1.readFileSync)(logfilePath, 'utf8');
            }
            catch (error) {
                (0, fs_1.appendFile)(logfilePath, "", function (err) {
                    if (err) {
                        console.log("err here " + err);
                    }
                });
                logData = (0, fs_1.readFileSync)(logfilePath, 'utf8');
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
    });
}
exports.displayTestCases = displayTestCases;
function displayPreviousTestResults(webview) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Displaying previous test results');
        try {
            const reportsFolder = ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath) + '/keploy/reports';
            if (!fs.existsSync(reportsFolder)) {
                webview.postMessage({
                    type: 'aggregatedTestResults',
                    data: { success: 0, failure: 0, total: 0 },
                    error: true,
                    value: 'Run keploy test to generate test reports.'
                });
                return;
            }
            const testRunDirs = fs.readdirSync(reportsFolder).filter(dir => fs.statSync(path.join(reportsFolder, dir)).isDirectory());
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
                return aTime - bTime;
            });
            let totalSuccess = 0;
            let totalFailure = 0;
            let totalTests = 0;
            const testResults = [];
            for (const testRunDir of testRunDirs) {
                const testRunPath = path.join(reportsFolder, testRunDir);
                const testFiles = fs.readdirSync(testRunPath).filter(file => file.startsWith('test-set-') && file.endsWith('-report.yaml'));
                for (const testFile of testFiles) {
                    const testFilePath = path.join(testRunPath, testFile);
                    const fileContents = fs.readFileSync(testFilePath, 'utf8');
                    const report = jsyaml.load(fileContents);
                    totalSuccess += report.success;
                    totalFailure += report.failure;
                    totalTests += report.total;
                    if (report.tests) {
                        report.tests.forEach(test => {
                            testResults.push({
                                date: new Date(test.resp.header.Date).toLocaleDateString('en-GB'),
                                method: test.req.method,
                                name: test.name,
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
        }
        catch (error) {
            console.log(error);
            webview.postMessage({
                type: 'aggregatedTestResults',
                data: { success: 0, failure: 0, total: 0 },
                error: true,
                value: 'Run keploy test to generate test reports.'
            });
        }
    });
}
exports.displayPreviousTestResults = displayPreviousTestResults;
function startTesting(command, folderPath, wslscriptPath, wsllogfilePath, bashScriptPath, zshScriptPath, logfilePath, webview) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return new Promise((resolve, reject) => {
                try {
                    let terminalPath;
                    let currentShell = '';
                    if (process.platform === 'win32') {
                        terminalPath = 'wsl.exe';
                    }
                    else {
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
                        const testCmd = `${wslscriptPath}  "${wsllogfilePath}" "${folderPath}" "${command}" ;exit 0  `;
                        terminal.sendText(testCmd);
                    }
                    else {
                        let testCmd;
                        if (currentShell.includes('zsh')) {
                            // Use a Zsh-specific script if needed
                            console.log('Using Zsh script');
                            //replace bashScriptPath with zshScriptPath for zsh
                            testCmd = `"${bashScriptPath}" "${logfilePath}" "${folderPath}" "${command}"; exit 0`;
                        }
                        else {
                            // Default to Bash script
                            testCmd = `"${bashScriptPath}" "${logfilePath}" "${folderPath}" "${command}" ;`;
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
                }
                catch (error) {
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
    });
}
exports.startTesting = startTesting;
function stopTesting() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (_a = vscode.window.activeTerminal) === null || _a === void 0 ? void 0 : _a.sendText('\x03', true);
            (_b = vscode.window.activeTerminal) === null || _b === void 0 ? void 0 : _b.dispose();
            return;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    });
}
exports.stopTesting = stopTesting;
//# sourceMappingURL=Test.js.map