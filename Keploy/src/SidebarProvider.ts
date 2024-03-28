import * as vscode from "vscode";
import { getNonce } from "./nonce/getNonce";
import { startRecording } from './main/recordKeploy';
import { displayTestCases } from "./main/testKeploy";
import { shellExecutor } from "./shell/shellExe";


const KEY = "vstodotoken";
export class TokenManage{
  static globalState : vscode.Memento;

  static setToken(token:string){
      return this.globalState.update(KEY, token);
  }

  static getToken(): string | undefined{
      return this.globalState.get(KEY);
  }
}

const recordOptions: vscode.OpenDialogOptions = {
  canSelectFolders: true,
  canSelectMany: false,
  openLabel: 'Select folder',
  title: 'Select folder',
};

let versionOutput = '';
    (async()=>{
      try {
        versionOutput = await shellExecutor('exampleapp --version');
    } catch (error) {
        console.log("Error fetching version using command alias: " + error);
        try {
            versionOutput = await shellExecutor('/usr/local/bin/exampleapp --version');
        } catch (error) {
            console.log("Error fetching version using absolute path: " + error);
            throw error;
        }
    }
    });
const testOptions: vscode.OpenDialogOptions = {
  canSelectFolders: true,
  canSelectMany: false,
  openLabel: 'Select folder to run test cases for',
  title: 'Select folder to run test cases for',
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  
  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, "out", "compiled"),
        vscode.Uri.joinPath(this._extensionUri, "media"),
        vscode.Uri.joinPath(this._extensionUri, "sidebar"),
        vscode.Uri.joinPath(this._extensionUri, "scripts"),
      ],
    };

    
    const scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Home.js")
    );
    const compiledCSSUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Home.css")
    );

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, compiledCSSUri, scriptUri);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo":
          if (!data.value) {return;}
          vscode.window.showInformationMessage(data.value);
          break;

        case "onError":
          if (!data.value) {return;}
          vscode.window.showErrorMessage(data.value);
          break;

        case "selectRecordFolder":
          if (!data.value) {return;}
          try {
            console.log('Opening Record Dialogue Box...');
            vscode.window.showOpenDialog(recordOptions).then(async fileUri => {
              if (fileUri && fileUri[0]) {
                console.log('Selected file: ' + fileUri[0].fsPath);
                this._view?.webview.postMessage({ type: 'recordfile', value: `${fileUri[0].fsPath}` });
              }
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;

        case 'startRecordingCommand':
          if (!data.value) {return;}
          try {
            console.log('Start Recording button clicked');

const script = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.sh");
const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.log");

let wslscriptPath = script.fsPath;
let wsllogPath = logfilePath.fsPath;

if (process.platform === 'win32') {
    wslscriptPath = wslscriptPath.replace(/\\/g, '/');
    wsllogPath = wsllogPath.replace(/\\/g, '/');
    wslscriptPath = '/mnt' + wslscriptPath.replace(/:/g, '');
    wsllogPath = '/mnt' + wsllogPath.replace(/:/g, '');
}

console.log("Script path: " + wslscriptPath);
console.log("Log path: " + wsllogPath);

            await startRecording(data.command, data.filePath, data.generatedRecordCommand, wslscriptPath, wsllogPath, script.fsPath, logfilePath.fsPath, this._view?.webview);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;

        case 'stopRecordingCommand':
          if (!data.value) {return;}
          try {
            console.log("Stopping recording");
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
          }
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview, compiledCSSUri: vscode.Uri, scriptUri: vscode.Uri) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.css")
    );
    const scriptMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.js")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const nonce = getNonce();

    const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
    setTimeout(() => {
      displayTestCases(logfilePath.fsPath, webview, true, false);
    }, 3000);

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
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
    
