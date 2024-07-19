import * as vscode from "vscode";
// import context from "vscode";
import { getNonce } from "./Utils";
// import { downloadAndUpdate , downloadAndInstallkeployary ,downloadAndUpdateDocker  } from './updateKeploy';
import { startRecording , stopRecording } from "./Record";
import { startTesting , stopTesting ,  displayTestCases , displayPreviousTestResults } from "./Test";
import { existsSync } from "fs";
import { handleInitializeKeployConfigFile, handleOpenKeployConfigFile } from "./Config";

const recordOptions: vscode.OpenDialogOptions = {
  canSelectFolders: true,
  canSelectMany: false,
  openLabel: 'Select folder to record test cases for',
  title: 'Select folder to record test cases for',
};

const testOptions: vscode.OpenDialogOptions = {
  canSelectFolders: true,
  canSelectMany: false,
  openLabel: 'Select folder to run test cases for',
  title: 'Select folder to run test cases for',
};


export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {
   }

   public postMessage(type: any, value: any) {
    console.log('postMessage');
    this._view?.webview.postMessage({ type: type, value: value });
  }

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
    

    let scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Config.js")
    );
    let compiledCSSUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Config.css")
    );
    
    //if config file is already present then navigate to keploy page
    const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const configFilePath = folderPath + '/keploy.yml';
    if (existsSync(configFilePath)) {
      scriptUri = webviewView.webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "out", "compiled/KeployHome.js")
      );
      compiledCSSUri = webviewView.webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "out", "compiled/KeployHome.css")
      );
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview ,  compiledCSSUri , scriptUri);

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
        case "selectRecordFolder": {
          if (!data.value) {
            return;
          } try {
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
        }

        case 'viewLogs' : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Logs...');
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", data.value);
            //open in  editor
            vscode.workspace.openTextDocument(logfilePath).then(doc => {
              vscode.window.showTextDocument(doc, { preview: false });
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open logs ${error}` });
          }
          break;
        }
        case 'startRecordingCommand' : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Recording button clicked');

            const bashScript =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.sh");
            const zshScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.zsh");
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "record_mode.log");
            let wslscriptPath = bashScript.fsPath;
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
            console.log("bashScript path" + wslscriptPath);
            console.log(wsllogPath);

            
            await startRecording( wslscriptPath , wsllogPath , bashScript.fsPath , zshScript.fsPath ,logfilePath.fsPath , this._view?.webview );
            this._view?.webview.postMessage({ type: 'success', value: 'Recording Started' });
            this._view?.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
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

        case "selectTestFolder":{
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Test Dialogue Box...');
            vscode.window.showOpenDialog(testOptions).then(async fileUri => {
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
            const bashScript =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.sh");
            const zshScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.zsh");
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "test_mode.log");
            let wslscriptPath = bashScript.fsPath;
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
            await startTesting( wslscriptPath , wsllogPath , bashScript.fsPath ,zshScript.fsPath, logfilePath.fsPath ,this._view?.webview );
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
        case "navigate" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Navigate to ' + data.value);
            const recordPageJs = webviewView.webview.asWebviewUri(
              vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${data.value}.js`)
            );
            const recordPageCss = webviewView.webview.asWebviewUri(
              vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${data.value}.css`)
            );
            webviewView.webview.html = this._getHtmlForWebview(webviewView.webview ,  recordPageCss , recordPageJs);
            this._view?.webview.postMessage({ type: 'openRecordPage', value: 'Record Page opened' });
        
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open record page ${error}` });
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
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open recorded test file ${error}` });
          }
          break;
        }

        case "viewCompleteSummary" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Complete Summary...');
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "test_mode.log");
            displayTestCases(logfilePath.fsPath, this._view?.webview , false , true);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open complete summary ${error}` });
          }
          break;

        }

        case "viewPreviousTestResults" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Previous Test Results...');
            displayPreviousTestResults( this._view?.webview);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open previous test results ${error}` });
          }
          break;

        }

        case "aggregatedTestResults" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Aggregated Test Results...');
            this._view?.webview.postMessage({ type: 'aggregatedTestResults', data: data.data , error: data.error , value : data.value});
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open aggregated test results ${error}` });
          }
          break;

        }

        case "openConfigFile" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Calling handleOpenKeployConfigFile' + data.value);
            handleOpenKeployConfigFile(this._view?.webview);
          } catch (error) {

            console.log('Config file not found here in catch');
            this._view?.webview.postMessage({ type: 'configNotFound', value: `Failed to open config file ${error}` });
          }
          break;
        }
        case "initialiseConfig" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Initialising Config File...');
            handleInitializeKeployConfigFile(this._view?.webview , data.path , data.command);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to initialise config file ${error}` });
          }
          break;
        }
        // case "setupConfigFile" : {

        // }
        case "openTestFile" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Test File...' + data.value);
            vscode.workspace.openTextDocument(data.value).then(doc => {
              vscode.window.showTextDocument(doc, { preview: false });
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open test file ${error}` });
          }
          break;
        }
      }

    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }
  private _getHtmlForWebview(webview: vscode.Webview , compiledCSSUri: vscode.Uri , scriptUri: vscode.Uri) {
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

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();
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
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
      }; script-src 'nonce-${nonce}';">    
  	<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${compiledCSSUri}" rel="stylesheet">
			</head>
      <body>
				
			</body>
      <script nonce="${nonce}" src="${scriptUri}"></script>
        <script type="module" nonce="${nonce}" src="${scriptMainUri}"></script>
			</html>`;
  }
}
