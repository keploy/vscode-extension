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
exports.downloadAndInstallKeployBinary = exports.downloadAndUpdateDocker = exports.downloadAndUpdate = void 0;
const vscode = __importStar(require("vscode"));
const version_1 = require("./version");
function downloadAndUpdate(downloadUrl, webview) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const keployVersion = yield (0, version_1.getCurrentKeployVersion)();
            const latestVersion = yield (0, version_1.getKeployVersion)();
            // Remove "v" from the beginning of the latest version string, if present
            const formattedLatestVersion = latestVersion.startsWith('v') ? latestVersion.substring(1) : latestVersion;
            console.log('Latest Keploy version:', formattedLatestVersion);
            if (keployVersion === formattedLatestVersion) {
                vscode.window.showInformationMessage('Keploy is already up to date');
                return;
            }
            console.log('Downloading and updating Keploy binary...');
            vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
            downloadAndInstallKeployBinary(webview).then(() => {
                vscode.window.showInformationMessage('Updated Keploy binary successfully!');
            }).catch(error => {
                console.error('Failed to update Keploy binary:', error);
                vscode.window.showErrorMessage('Failed to update Keploy binary oh no: ' + error);
                throw error;
            });
        }
        catch (error) {
            if (error.toString().toLowerCase().includes("not found") || error.toString().toLowerCase().includes("command not found") || error.toString().toLowerCase().includes("no such file or directory")) {
                //post message to webview
                webview.postMessage({ type: 'onError', value: `Keploy binary not found. Installing Keploy binary first.` });
                downloadAndInstallKeployBinary(webview).then(() => {
                    vscode.window.showInformationMessage('Updated Keploy binary successfully!');
                }).catch(error => {
                    console.error('Failed to update Keploy binary here:', error);
                    vscode.window.showErrorMessage('Failed to update Keploy binary: ' + error);
                    throw error;
                });
            }
            else {
                console.error('Error occurred during download and update:', error);
                vscode.window.showErrorMessage('Error occurred during updating binary: ' + error);
                throw error;
            }
        }
    });
}
exports.downloadAndUpdate = downloadAndUpdate;
function downloadAndUpdateDocker() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                console.log('Downloading and updating Keploy Docker image...');
                let bashPath;
                if (process.platform === 'win32') {
                    // If on Windows, use the correct path to WSL's Bash shell
                    bashPath = 'wsl.exe';
                }
                else {
                    // Otherwise, assume Bash is available at the standard location
                    bashPath = '/bin/bash';
                }
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: bashPath
                });
                // Show the terminal
                terminal.show();
                const dockerCmd = 'docker pull ghcr.io/keploy/keploy:latest ; exit 0';
                terminal.sendText(dockerCmd);
                vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
                // Listen for terminal close event
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose(); // Dispose the listener
                        resolve();
                    }
                });
            }
            catch (error) {
                throw error;
                // reject(error); // Reject the promise if an error occurs during execution
            }
        });
    });
}
exports.downloadAndUpdateDocker = downloadAndUpdateDocker;
function downloadAndInstallKeployBinary(webview) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Downloading and installing Keploy binary...');
        return new Promise((resolve, reject) => {
            try {
                let bashPath;
                if (process.platform === 'win32') {
                    // If on Windows, use the correct path to WSL's Bash shell
                    bashPath = 'wsl.exe';
                }
                else {
                    // Otherwise, assume Bash is available at the standard location
                    bashPath = '/bin/bash';
                }
                // Create a new terminal instance with the Bash shell
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: bashPath
                });
                // Show the terminal
                terminal.show();
                const curlCmd = " curl -O https://raw.githubusercontent.com/keploy/keploy/main/keploy.sh && source keploy.sh && exit 0";
                terminal.sendText(curlCmd);
                vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
                // Listen for terminal close event
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose(); // Dispose the listener
                        resolve();
                    }
                });
            }
            catch (error) {
                reject(error); // Reject the promise if an error occurs during execution
            }
        });
    });
}
exports.downloadAndInstallKeployBinary = downloadAndInstallKeployBinary;
//# sourceMappingURL=updateKeploy.js.map