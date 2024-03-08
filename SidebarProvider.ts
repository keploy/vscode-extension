import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { downloadAndUpdate , downloadAndInstallKeployBinary ,downloadAndUpdateDocker  } from './updateKeploy';
import { startRecording , stopRecording } from './Record';
import { startTesting , stopTesting } from "./Test";

const options: vscode.OpenDialogOptions = {
  canSelectFiles: true,
  canSelectMany: false,
  openLabel: 'Select file to record test cases for',
  title: 'Select file to record test cases for',
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
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

    webviewView.webview.onDidReceiveMessage(async (data) => {
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
            await downloadAndUpdate("https://github.com/keploy/keploy/releases/latest/download/keploy_linux_amd64.tar.gz" , this._view?.webview);
            this._view?.webview.postMessage({ type: 'success', value: 'Keploy binary updated!' });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to update Keploy binary: ${error}` });
          }
          break;
        }
        case "installKeploy": {
          if (!data.value) {
            return;
          }
          try {
            console.log('Installing Keploy binary...');
            await downloadAndInstallKeployBinary( this._view?.webview);

            this._view?.webview.postMessage({ type: 'success', value: 'Keploy binary installed!' });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to install Keploy binary: ${error}` });
          }
          break;
        }

        case "updateKeployDocker": {
          if (!data.value) {
            return;
          }
          try {
            await downloadAndUpdateDocker();
            this._view?.webview.postMessage({ type: 'success', value: 'Keploy Docker updated!' });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to update Keploy Docker ${error}` });
          }
          break;
        }
        case "record": {
          if (!data.value) {
            return;
          } try {
            console.log('Record button clicked');
            vscode.window.showOpenDialog(options).then(async fileUri => {
              if (fileUri && fileUri[0]) {
                console.log('Selected file: ' + fileUri[0].fsPath);
                this._view?.webview.postMessage({ type: 'recordfile', value: `${fileUri[0].fsPath}` });
                // console.log(this._view?.webview.html.getElementById('filePathDiv'));
                // this._view?.webview.html.getElementById('filePathDiv')!.innerHTML = `<p>Your Selected File is ${fileUri[0].fsPath}</p>`;
              }
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;
        }
        case 'startRecordingCommand' : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Recording button clicked');

            const script =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.sh");
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.log");
            let wslscriptPath = script.fsPath;
            let wsllogPath = logfilePath.fsPath;
            if(process.platform === 'win32'){
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
            await startRecording(data.command , data.filePath , wslscriptPath , wsllogPath , script.fsPath , logfilePath.fsPath , this._view?.webview );
            // this._view?.webview.postMessage({ type: 'success', value: 'Recording Started' });
            // this._view?.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;
        }
        case 'stopRecordingCommand' : {
          if (!data.value) {
            return;
          }
          try{
            console.log("Stopping recording");
            await stopRecording();

          }
          catch(error){
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
          }
          break;
        }

        case "test":{
          if (!data.value) {
            return;
          }
          try {
            console.log('Test button clicked');
            vscode.window.showOpenDialog(options).then(async fileUri => {
              if (fileUri && fileUri[0]) {
                console.log('Selected file: ' + fileUri[0].fsPath);
                this._view?.webview.postMessage({ type: 'testfile', value: `${fileUri[0].fsPath}` });
              }
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
          }
          break;
        }

        case 'startTestingCommand' : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Testing button clicked');
            const script =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.sh");
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
            let wslscriptPath = script.fsPath;
            let wsllogPath = logfilePath.fsPath;
            if(process.platform === 'win32'){
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
            await startTesting(data.command , data.filePath , wslscriptPath , wsllogPath , script.fsPath , logfilePath.fsPath ,this._view?.webview );
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
          }
          break;
        } 
        case 'stopTestingCommand' : {
          if (!data.value) {
            return;
          }
          try{
            console.log("Stopping Testing");
            await stopTesting();
          }
          catch(error){
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop Testing ${error}` });
          }
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Main.js")
    );
    const compiledCSSUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Main.css")
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

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
      }; script-src 'nonce-${nonce}';">    
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
