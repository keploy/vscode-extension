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
const yaml = __importStar(require("yaml"));
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
                webview.postMessage({ type: 'aggregatedTestResults', data: { success: 0, failure: 0, total: 0 }, error: true, value: 'Run keploy test to generate test reports.' });
                // throw new Error('Reports directory does not exist');
                return;
            }
            const testRunDirs = fs.readdirSync(reportsFolder).filter(dir => fs.statSync(path.join(reportsFolder, dir)).isDirectory());
            if (testRunDirs.length === 0) {
                webview.postMessage({ type: 'aggregatedTestResults', data: { success: 0, failure: 0, total: 0 }, error: true, value: 'Run keploy test to generate test reports.' });
                // throw new Error('No test run directories found');
            }
            // Sort directories to find the latest test run
            testRunDirs.sort((a, b) => parseInt(b.split('-').pop()) - parseInt(a.split('-').pop()));
            const latestTestRunDir = testRunDirs[0];
            const latestTestRunPath = path.join(reportsFolder, latestTestRunDir);
            console.log(`Reading reports from the latest test run directory: ${latestTestRunDir}`);
            const testFiles = fs.readdirSync(latestTestRunPath).filter(file => file.startsWith('test-set-') && file.endsWith('-report.yaml'));
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
        }
        catch (error) {
            console.log(error);
            webview.postMessage({ type: 'aggregatedTestResults', data: { success: 0, failure: 0, total: 0 }, error: true, value: 'Run keploy test to generate test reports.' });
        }
    });
}
exports.displayPreviousTestResults = displayPreviousTestResults;
function startTesting(command, folderPath, generatedTestCommand, wslscriptPath, wsllogfilePath, scriptPath, logfilePath, webview) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return new Promise((resolve, reject) => {
                try {
                    let bashPath;
                    if (process.platform === 'win32') {
                        bashPath = 'wsl.exe';
                    }
                    else {
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
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (_a = vscode.window.activeTerminal) === null || _a === void 0 ? void 0 : _a.sendText('\x03', true);
            //set timeout for 5 seconds
            setTimeout(() => {
                var _a;
                (_a = vscode.window.activeTerminal) === null || _a === void 0 ? void 0 : _a.dispose();
            }, 5000);
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