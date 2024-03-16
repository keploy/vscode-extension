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
exports.stopTesting = exports.startTesting = exports.displayTestCases = void 0;
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
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
function startTesting(command, filepath, generatedTestCommand, wslscriptPath, wsllogfilePath, scriptPath, logfilePath, webview) {
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
                    generatedTestCommand = generatedTestCommand.replace('keploy', '');
                    const terminal = vscode.window.createTerminal({
                        name: 'Keploy Terminal',
                        shellPath: bashPath,
                    });
                    terminal.show();
                    if (process.platform === 'win32') {
                        const testCmd = `${wslscriptPath} "${generatedTestCommand}" "${filepath}" "${wsllogfilePath}" ;exit 0 `;
                        terminal.sendText(testCmd);
                    }
                    else {
                        const testCmd = `sudo ${scriptPath} "${generatedTestCommand}" "${filepath}" "${logfilePath}" ;exit 0 `;
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
            (_a = vscode.window.activeTerminal) === null || _a === void 0 ? void 0 : _a.dispose();
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