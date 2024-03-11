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
const updateKeploy_1 = require("./updateKeploy");
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
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
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
                case "updateKeploy": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        yield (0, updateKeploy_1.downloadAndUpdate)("https://github.com/keploy/keploy/releases/latest/download/keploy_linux_amd64.tar.gz", (_a = this._view) === null || _a === void 0 ? void 0 : _a.webview);
                        (_b = this._view) === null || _b === void 0 ? void 0 : _b.webview.postMessage({ type: 'success', value: 'Keploy binary updated!' });
                    }
                    catch (error) {
                        (_c = this._view) === null || _c === void 0 ? void 0 : _c.webview.postMessage({ type: 'error', value: `Failed to update Keploy binary: ${error}` });
                    }
                    break;
                }
                case "installKeploy": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Installing Keploy binary...');
                        yield (0, updateKeploy_1.downloadAndInstallKeployBinary)((_d = this._view) === null || _d === void 0 ? void 0 : _d.webview);
                        (_e = this._view) === null || _e === void 0 ? void 0 : _e.webview.postMessage({ type: 'success', value: 'Keploy binary installed!' });
                    }
                    catch (error) {
                        (_f = this._view) === null || _f === void 0 ? void 0 : _f.webview.postMessage({ type: 'error', value: `Failed to install Keploy binary: ${error}` });
                    }
                    break;
                }
                case "updateKeployDocker": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        yield (0, updateKeploy_1.downloadAndUpdateDocker)();
                        (_g = this._view) === null || _g === void 0 ? void 0 : _g.webview.postMessage({ type: 'success', value: 'Keploy Docker updated!' });
                    }
                    catch (error) {
                        (_h = this._view) === null || _h === void 0 ? void 0 : _h.webview.postMessage({ type: 'error', value: `Failed to update Keploy Docker ${error}` });
                    }
                    break;
                }
                case "record": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Record button clicked');
                        vscode.window.showOpenDialog(recordOptions).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                            var _s;
                            if (fileUri && fileUri[0]) {
                                console.log('Selected file: ' + fileUri[0].fsPath);
                                (_s = this._view) === null || _s === void 0 ? void 0 : _s.webview.postMessage({ type: 'recordfile', value: `${fileUri[0].fsPath}` });
                                // console.log(this._view?.webview.html.getElementById('filePathDiv'));
                                // this._view?.webview.html.getElementById('filePathDiv')!.innerHTML = `<p>Your Selected File is ${fileUri[0].fsPath}</p>`;
                            }
                        }));
                    }
                    catch (error) {
                        (_j = this._view) === null || _j === void 0 ? void 0 : _j.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
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
                        yield (0, Record_1.startRecording)(data.command, data.filePath, wslscriptPath, wsllogPath, script.fsPath, logfilePath.fsPath, (_k = this._view) === null || _k === void 0 ? void 0 : _k.webview);
                        // this._view?.webview.postMessage({ type: 'success', value: 'Recording Started' });
                        // this._view?.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
                    }
                    catch (error) {
                        (_l = this._view) === null || _l === void 0 ? void 0 : _l.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
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
                        (_m = this._view) === null || _m === void 0 ? void 0 : _m.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
                    }
                    break;
                }
                case "test": {
                    if (!data.value) {
                        return;
                    }
                    try {
                        console.log('Test button clicked');
                        vscode.window.showOpenDialog(testOptions).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                            var _t;
                            if (fileUri && fileUri[0]) {
                                console.log('Selected file: ' + fileUri[0].fsPath);
                                (_t = this._view) === null || _t === void 0 ? void 0 : _t.webview.postMessage({ type: 'testfile', value: `${fileUri[0].fsPath}` });
                            }
                        }));
                    }
                    catch (error) {
                        (_o = this._view) === null || _o === void 0 ? void 0 : _o.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
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
                        yield (0, Test_1.startTesting)(data.command, data.filePath, wslscriptPath, wsllogPath, script.fsPath, logfilePath.fsPath, (_p = this._view) === null || _p === void 0 ? void 0 : _p.webview);
                    }
                    catch (error) {
                        (_q = this._view) === null || _q === void 0 ? void 0 : _q.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
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
                        (_r = this._view) === null || _r === void 0 ? void 0 : _r.webview.postMessage({ type: 'error', value: `Failed to Stop Testing ${error}` });
                    }
                    break;
                }
            }
        }));
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Main.js"));
        const compiledCSSUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Main.css"));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.css"));
        const scriptMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.js"));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
        // Use a nonce to only allow a specific script to be run.
        const nonce = (0, getNonce_1.getNonce)();
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