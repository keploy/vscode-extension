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
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
// import context from "vscode";
const Utils_1 = require("./Utils");
// import { downloadAndUpdate , downloadAndInstallkeployary ,downloadAndUpdateDocker  } from './updateKeploy';
const Record_1 = require("./Record");
const Test_1 = require("./Test");
const fs_1 = require("fs");
const Config_1 = require("./Config");
const recordOptions = {
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select folder to record test cases for',
    title: 'Select folder to record test cases for',
};
const testOptions = {
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select folder to run test cases for',
    title: 'Select folder to run test cases for',
};
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    postMessage(type, value) {
        var _a;
        console.log('postMessage');
        (_a = this._view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({ type: type, value: value });
    }
    resolveWebviewView(webviewView) {
        var _a;
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri,
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled"),
                vscode.Uri.joinPath(this._extensionUri, "media"),
                vscode.Uri.joinPath(this._extensionUri, "sidebar"),
                vscode.Uri.joinPath(this._extensionUri, "scripts"),
            ],
        };
        let scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Config.js"));
        let compiledCSSUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Config.css"));
        //if config file is already present then navigate to keploy page
        const folderPath = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
        const configFilePath = folderPath + '/keploy.yml';
        if ((0, fs_1.existsSync)(configFilePath)) {
            scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/KeployHome.js"));
            compiledCSSUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/KeployHome.css"));
        }
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, compiledCSSUri, scriptUri);
        webviewView.webview.onDidReceiveMessage((data) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
            switch (data.type) {
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
                // case "selectRecordFolder": {
                //   if (!data.value) {
                //     return;
                //   } try {
                //     console.log('Opening Record Dialogue Box...');
                //     vscode.window.showOpenDialog(recordOptions).then(async fileUri => {
                //       if (fileUri && fileUri[0]) {
                //         console.log('Selected file: ' + fileUri[0].fsPath);
                //         this._view?.webview.postMessage({ type: 'recordfile', value: `${fileUri[0].fsPath}` });
                //       }
                //     });
                //   } catch (error) {
                //     this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
                //   }
                //   break;
                // }
                case 'viewLogs': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Logs...');
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", data.value);
                        //open in  editor
                        vscode.workspace.openTextDocument(logfilePath).then(doc => {
                            vscode.window.showTextDocument(doc, { preview: false });
                        });
                    }
                    catch (error) {
                        (_b = this._view) === null || _b === void 0 ? void 0 : _b.webview.postMessage({ type: 'error', value: `Failed to open logs ${error}` });
                    }
                    break;
                }
                case 'startRecordingCommand': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Start Recording button clicked');
                        const bashScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.sh");
                        const zshScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.zsh");
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "record_mode.log");
                        let wslscriptPath = bashScript.fsPath;
                        let wsllogPath = logfilePath.fsPath;
                        if (process.platform === 'win32') {
                            //convert filepaths to windows format
                            wslscriptPath = wslscriptPath.replace(/\\/g, '/');
                            wsllogPath = wsllogPath.replace(/\\/g, '/');
                            //add /mnt/ to the start of the path
                            wslscriptPath = '/mnt/' + wslscriptPath;
                            wsllogPath = '/mnt/' + wsllogPath;
                            // remove : from the path
                            wslscriptPath = wslscriptPath.replace(/:/g, '');
                            wsllogPath = wsllogPath.replace(/:/g, '');
                        }
                        console.log("bashScript path" + wslscriptPath);
                        console.log(wsllogPath);
                        yield (0, Record_1.startRecording)(wslscriptPath, wsllogPath, bashScript.fsPath, zshScript.fsPath, logfilePath.fsPath, (_c = this._view) === null || _c === void 0 ? void 0 : _c.webview);
                        (_d = this._view) === null || _d === void 0 ? void 0 : _d.webview.postMessage({ type: 'success', value: 'Recording Started' });
                        (_e = this._view) === null || _e === void 0 ? void 0 : _e.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
                    }
                    catch (error) {
                        (_f = this._view) === null || _f === void 0 ? void 0 : _f.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
                    }
                    break;
                }
                case 'stopRecordingCommand': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log("Stopping recording");
                        yield (0, Record_1.stopRecording)();
                    }
                    catch (error) {
                        (_g = this._view) === null || _g === void 0 ? void 0 : _g.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
                    }
                    break;
                }
                // case "selectTestFolder":{
                //   if (!data.value) {
                //     return;
                //   }
                //   try {
                //     console.log('Opening Test Dialogue Box...');
                //     vscode.window.showOpenDialog(testOptions).then(async fileUri => {
                //       if (fileUri && fileUri[0]) {
                //         console.log('Selected file: ' + fileUri[0].fsPath);
                //         this._view?.webview.postMessage({ type: 'testfile', value: `${fileUri[0].fsPath}` });
                //       }
                //     });
                //   } catch (error) {
                //     this._view?.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
                //   }
                //   break;
                // }
                case 'startTestingCommand': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Start Testing button clicked');
                        const bashScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.sh");
                        const zshScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.zsh");
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "test_mode.log");
                        let wslscriptPath = bashScript.fsPath;
                        let wsllogPath = logfilePath.fsPath;
                        if (process.platform === 'win32') {
                            //convert filepaths to windows format
                            wslscriptPath = wslscriptPath.replace(/\\/g, '/');
                            wsllogPath = wsllogPath.replace(/\\/g, '/');
                            //add /mnt/ to the start of the path
                            wslscriptPath = '/mnt/' + wslscriptPath;
                            wsllogPath = '/mnt/' + wsllogPath;
                            // remove : from the path
                            wslscriptPath = wslscriptPath.replace(/:/g, '');
                            wsllogPath = wsllogPath.replace(/:/g, '');
                        }
                        yield (0, Test_1.startTesting)(wslscriptPath, wsllogPath, bashScript.fsPath, zshScript.fsPath, logfilePath.fsPath, (_h = this._view) === null || _h === void 0 ? void 0 : _h.webview);
                    }
                    catch (error) {
                        (_j = this._view) === null || _j === void 0 ? void 0 : _j.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
                    }
                    break;
                }
                case 'stopTestingCommand': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log("Stopping Testing");
                        yield (0, Test_1.stopTesting)();
                    }
                    catch (error) {
                        (_k = this._view) === null || _k === void 0 ? void 0 : _k.webview.postMessage({ type: 'error', value: `Failed to Stop Testing ${error}` });
                    }
                    break;
                }
                case "navigate": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Navigate to ' + data.value);
                        const recordPageJs = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${data.value}.js`));
                        const recordPageCss = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${data.value}.css`));
                        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, recordPageCss, recordPageJs);
                        (_l = this._view) === null || _l === void 0 ? void 0 : _l.webview.postMessage({ type: 'openRecordPage', value: 'Record Page opened' });
                    }
                    catch (error) {
                        (_m = this._view) === null || _m === void 0 ? void 0 : _m.webview.postMessage({ type: 'error', value: `Failed to open record page ${error}` });
                    }
                    break;
                }
                case "openRecordedTestFile": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Recorded Test File...' + data.value);
                        vscode.workspace.openTextDocument(data.value).then(doc => {
                            vscode.window.showTextDocument(doc, { preview: false });
                        });
                    }
                    catch (error) {
                        (_o = this._view) === null || _o === void 0 ? void 0 : _o.webview.postMessage({ type: 'error', value: `Failed to open recorded test file ${error}` });
                    }
                    break;
                }
                case "viewCompleteSummary": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Complete Summary...');
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "test_mode.log");
                        (0, Test_1.displayTestCases)(logfilePath.fsPath, (_p = this._view) === null || _p === void 0 ? void 0 : _p.webview, false, true);
                    }
                    catch (error) {
                        (_q = this._view) === null || _q === void 0 ? void 0 : _q.webview.postMessage({ type: 'error', value: `Failed to open complete summary ${error}` });
                    }
                    break;
                }
                case "viewPreviousTestResults": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Previous Test Results...');
                        (0, Test_1.displayPreviousTestResults)((_r = this._view) === null || _r === void 0 ? void 0 : _r.webview);
                    }
                    catch (error) {
                        (_s = this._view) === null || _s === void 0 ? void 0 : _s.webview.postMessage({ type: 'error', value: `Failed to open previous test results ${error}` });
                    }
                    break;
                }
                case "aggregatedTestResults": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Aggregated Test Results...');
                        (_t = this._view) === null || _t === void 0 ? void 0 : _t.webview.postMessage({ type: 'aggregatedTestResults', data: data.data, error: data.error, value: data.value });
                    }
                    catch (error) {
                        (_u = this._view) === null || _u === void 0 ? void 0 : _u.webview.postMessage({ type: 'error', value: `Failed to open aggregated test results ${error}` });
                    }
                    break;
                }
                case "openConfigFile": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Calling handleOpenKeployConfigFile' + data.value);
                        (0, Config_1.handleOpenKeployConfigFile)((_v = this._view) === null || _v === void 0 ? void 0 : _v.webview);
                    }
                    catch (error) {
                        console.log('Config file not found here in catch');
                        (_w = this._view) === null || _w === void 0 ? void 0 : _w.webview.postMessage({ type: 'configNotFound', value: `Failed to open config file ${error}` });
                    }
                    break;
                }
                case "initialiseConfig": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Initialising Config File...');
                        (0, Config_1.handleInitializeKeployConfigFile)((_x = this._view) === null || _x === void 0 ? void 0 : _x.webview, data.path, data.command);
                    }
                    catch (error) {
                        (_y = this._view) === null || _y === void 0 ? void 0 : _y.webview.postMessage({ type: 'error', value: `Failed to initialise config file ${error}` });
                    }
                    break;
                }
                // case "setupConfigFile" : {
                // }
                case "openTestFile": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Test File...' + data.value);
                        vscode.workspace.openTextDocument(data.value).then(doc => {
                            vscode.window.showTextDocument(doc, { preview: false });
                        });
                    }
                    catch (error) {
                        (_z = this._view) === null || _z === void 0 ? void 0 : _z.webview.postMessage({ type: 'error', value: `Failed to open test file ${error}` });
                    }
                    break;
                }
            }
        }));
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview, compiledCSSUri, scriptUri) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.css"));
        const scriptMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.js"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        // Use a nonce to only allow a specific script to be run.
        const nonce = (0, Utils_1.getNonce)();
        //read the global state to check if the user is signed in
        // webview.postMessage({ type: 'displayPreviousTestResults', value: 'Displaying Previous Test Results' });
        // const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "test_mode.log");
        //call the function below after 3 seconds
        // setTimeout(() => {
        //   displayTestCases(logfilePath.fsPath, webview ,  true , false);
        // }, 3000);
        // displayTestCases(logfilePath.fsPath, webview);
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">   
      <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap" rel="stylesheet"> 
  	<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${compiledCSSUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
      <script nonce="${nonce}" src="${scriptMainUri}"></script>
      <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map