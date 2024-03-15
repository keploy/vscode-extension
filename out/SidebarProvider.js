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
const getNonce_1 = require("./getNonce");
const Record_1 = require("./Record");
const Test_1 = require("./Test");
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
    resolveWebviewView(webviewView) {
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
        const scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Home.js"));
        const compiledCSSUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Home.css"));
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, compiledCSSUri, scriptUri);
        webviewView.webview.onDidReceiveMessage((data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
                case "selectRecordFolder": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Record Dialogue Box...');
                        vscode.window.showOpenDialog(recordOptions).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                            var _p;
                            if (fileUri && fileUri[0]) {
                                console.log('Selected file: ' + fileUri[0].fsPath);
                                (_p = this._view) === null || _p === void 0 ? void 0 : _p.webview.postMessage({ type: 'recordfile', value: `${fileUri[0].fsPath}` });
                            }
                        }));
                    }
                    catch (error) {
                        (_a = this._view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
                    }
                    break;
                }
                case 'startRecordingCommand': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Start Recording button clicked');
                        const script = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.sh");
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.log");
                        let wslscriptPath = script.fsPath;
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
                        console.log("script path" + wslscriptPath);
                        console.log(wsllogPath);
                        // console.log(script.fsPath);
                        // console.log(logfilePath.fsPath);
                        yield (0, Record_1.startRecording)(data.command, data.filePath, wslscriptPath, wsllogPath, script.fsPath, logfilePath.fsPath, (_b = this._view) === null || _b === void 0 ? void 0 : _b.webview);
                        // this._view?.webview.postMessage({ type: 'success', value: 'Recording Started' });
                        // this._view?.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
                    }
                    catch (error) {
                        (_c = this._view) === null || _c === void 0 ? void 0 : _c.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
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
                        (_d = this._view) === null || _d === void 0 ? void 0 : _d.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
                    }
                    break;
                }
                case "selectTestFolder": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Test Dialogue Box...');
                        vscode.window.showOpenDialog(testOptions).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                            var _q;
                            if (fileUri && fileUri[0]) {
                                console.log('Selected file: ' + fileUri[0].fsPath);
                                (_q = this._view) === null || _q === void 0 ? void 0 : _q.webview.postMessage({ type: 'testfile', value: `${fileUri[0].fsPath}` });
                            }
                        }));
                    }
                    catch (error) {
                        (_e = this._view) === null || _e === void 0 ? void 0 : _e.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
                    }
                    break;
                }
                case 'startTestingCommand': {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Start Testing button clicked');
                        const script = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.sh");
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
                        let wslscriptPath = script.fsPath;
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
                        console.log("script path" + wslscriptPath);
                        console.log(wsllogPath);
                        yield (0, Test_1.startTesting)(data.command, data.filePath, wslscriptPath, wsllogPath, script.fsPath, logfilePath.fsPath, (_f = this._view) === null || _f === void 0 ? void 0 : _f.webview);
                    }
                    catch (error) {
                        (_g = this._view) === null || _g === void 0 ? void 0 : _g.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
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
                        (_h = this._view) === null || _h === void 0 ? void 0 : _h.webview.postMessage({ type: 'error', value: `Failed to Stop Testing ${error}` });
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
                        (_j = this._view) === null || _j === void 0 ? void 0 : _j.webview.postMessage({ type: 'openRecordPage', value: 'Record Page opened' });
                    }
                    catch (error) {
                        (_k = this._view) === null || _k === void 0 ? void 0 : _k.webview.postMessage({ type: 'error', value: `Failed to open record page ${error}` });
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
                        (_l = this._view) === null || _l === void 0 ? void 0 : _l.webview.postMessage({ type: 'error', value: `Failed to open recorded test file ${error}` });
                    }
                    break;
                }
                case "viewCompleteSummary": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Opening Complete Summary...');
                        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
                        (0, Test_1.displayTestCases)(logfilePath.fsPath, (_m = this._view) === null || _m === void 0 ? void 0 : _m.webview, false, true);
                    }
                    catch (error) {
                        (_o = this._view) === null || _o === void 0 ? void 0 : _o.webview.postMessage({ type: 'error', value: `Failed to open complete summary ${error}` });
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
        const nonce = (0, getNonce_1.getNonce)();
        // webview.postMessage({ type: 'displayPreviousTestResults', value: 'Displaying Previous Test Results' });
        const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
        //call the function below after 3 seconds
        setTimeout(() => {
            (0, Test_1.displayTestCases)(logfilePath.fsPath, webview, true, false);
        }, 1000);
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
  	<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${compiledCSSUri}" rel="stylesheet">
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
        <script type="module" nonce="${nonce}" src="${scriptMainUri}"></script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map