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
exports.startRecording = exports.stopRecording = exports.displayRecordedTestCases = void 0;
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
function displayRecordedTestCases(logfilePath, webview) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Displaying Recorded test  cases');
        let logData;
        try {
            try {
                logData = (0, fs_1.readFileSync)(logfilePath, 'utf8');
            }
            catch (error) {
                (0, fs_1.appendFile)(logfilePath, "", function (err) {
                    if (err) {
                        console.log("err here" + err);
                    }
                });
                logData = (0, fs_1.readFileSync)(logfilePath, 'utf8');
            }
            // Split the log data into lines
            const logLines = logData.split('\n');
            // Filter out the lines containing the desired information
            const capturedTestLines = logLines.filter(line => line.includes('🟠 Keploy has captured test cases'));
            // Display the captured test cases in your frontend
            if (capturedTestLines.length === 0) {
                webview.postMessage({
                    type: 'testcaserecorded',
                    value: 'Test Case has been recorded',
                    textContent: "No test cases captured. Please try again."
                });
                return;
            }
            capturedTestLines.forEach(testLine => {
                const testCaseInfo = JSON.parse(testLine.substring(testLine.indexOf('{')));
                // const testCaseElement = document.createElement('div');
                console.log(testCaseInfo);
                const textContent = `Test case "${testCaseInfo['testcase name']}" captured at ${testCaseInfo.path}`;
                webview.postMessage({
                    type: 'testcaserecorded',
                    value: 'Test Case has been recorded',
                    textContent: textContent
                });
                // recordedTestCasesDiv.appendChild(testCaseElement);
            });
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
            throw error;
        }
    });
}
exports.displayRecordedTestCases = displayRecordedTestCases;
function stopRecording() {
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
exports.stopRecording = stopRecording;
function startRecording(command, filepath, wslscriptPath, wsllogfilePath, scriptPath, logfilePath, webview) {
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
                    const terminal = vscode.window.createTerminal({
                        name: 'Keploy Terminal',
                        shellPath: bashPath,
                    });
                    terminal.show();
                    if (process.platform === 'win32') {
                        const recordCmd = `${wslscriptPath} "${command}" "${filepath}" "${wsllogfilePath}" ; exit 0`;
                        terminal.sendText(recordCmd);
                    }
                    else {
                        const recordCmd = `sudo ${scriptPath} "${command}" "${filepath}" "${logfilePath}" ; exit 0`;
                        // const exitCmd = 'exit';
                        terminal.sendText(recordCmd);
                    }
                    // terminal.sendText('exit', true);
                    // Listen for terminal close event
                    const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                        console.log('Terminal closed');
                        if (eventTerminal === terminal) {
                            disposable.dispose(); // Dispose the listener
                            displayRecordedTestCases(logfilePath, webview); // Call function when terminal is closed
                            resolve(); // Resolve the promise
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                    vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
                    reject(error);
                }
            });
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
            throw error;
        }
    });
}
exports.startRecording = startRecording;
//# sourceMappingURL=Record.js.map