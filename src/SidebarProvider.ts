import * as vscode from "vscode";
// import context from "vscode";
import { getNonce } from "./Utils";
// import { downloadAndUpdate , downloadAndInstallkeployary ,downloadAndUpdateDocker  } from './updateKeploy';
import { startRecording, stopRecording } from "./Record";
import { startTesting, stopTesting, displayTestCases, displayPreviousTestResults } from "./Test";
import { existsSync } from "fs";
import { handleInitializeKeployConfigFile, handleOpenKeployConfigFile,updateKeployYaml,PartialKeployConfig } from "./Config";
import SignInWithGitHub from "./SignIn";
import oneClickInstall from './OneClickInstall';
import * as path from 'path';
import * as fs from 'fs';
import { workspace } from 'vscode';
const yaml = require('js-yaml');

function precheckFunction(): Promise<string> {
  const workspacePath = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : '';

  return new Promise((resolve, reject) => {
    try {
      if (!workspacePath) {
        return reject('Workspace path not found.');
      }

      const pomFilePath = path.join(workspacePath, 'pom.xml');
      const goModFilePath = path.join(workspacePath, 'go.mod');
      const packageJsonFilePath = path.join(workspacePath, 'package.json');

      let projectType: string = 'python'; // Default project type is python
      if (fs.existsSync(pomFilePath)) {
        projectType = 'java';
      } else if (fs.existsSync(goModFilePath)) {
        projectType = 'go';
      } else if (fs.existsSync(packageJsonFilePath)) {
        projectType = 'javascript';
      }
      resolve(projectType);
    } catch (error) {
      reject(`Error checking project files: ${(error as Error).message}`);
    }
  });
}



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
  _interval?: NodeJS.Timeout; // Store the interval reference

  constructor(private readonly _extensionUri: vscode.Uri, private readonly _context: vscode.ExtensionContext) {
  }

  public postMessage(value: any) {
    if (!this._view) {
      vscode.window.showErrorMessage('Webview is not available');
      return;
    }
  
    let webviewView = this._view;

    try {
      console.log('Navigate to ' + value);
      let sveltePageJs: vscode.Uri;
      let sveltePageCss: vscode.Uri;
         if(value = "KeployChatBot"){
        sveltePageJs = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployChat.js")
        );
        sveltePageCss = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployChat.css")
        );

      }
      else {
        throw new Error("Unsupported navigation value");
      }

      // Save the language state
      // vscode.getState().then(() => {
      //   vscode.setState({ language: data.language });
      // });

      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, sveltePageCss, sveltePageJs);
    } catch (error) {
      this._view?.webview.postMessage({ type: 'error', value: `Failed to open page ${error}` });
    }
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

    const apiResponse = this._context.globalState.get<string>('apiResponse') || "No response";
    const signedIn = this._context.globalState.get<string>('SignedOthers') || "false";
    const progressBarVisible = this._context.globalState.get<boolean>('progressVisible') ?? true; 


    console.log("signedIn others  value", signedIn);


    let scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Config.js")
    );
    let compiledCSSUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Config.css")
    );


    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, compiledCSSUri, scriptUri);

    this._sendApiResponseToWebview(apiResponse, signedIn);


    // Start sending the updated `apiResponse` to the webview every 3 seconds
    this._startApiResponseUpdates();
    ;



    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        oneClickInstall();
      }
    });
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "getKeployConfig":{
          // Load the keploy.yml config file
          const workspaceFolders = vscode.workspace.workspaceFolders;
          if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
          }
    
          const keployFilePath = path.join(workspaceFolders[0].uri.fsPath, 'keploy.yml');
          
          if (!fs.existsSync(keployFilePath)) {
            vscode.window.showErrorMessage('keploy.yml file not found');
            return;
          }
    
          try {
            const fileContents = fs.readFileSync(keployFilePath, 'utf8');
            const config = yaml.load(fileContents); // Parse YAML into JS object
            
            // Send the config data back to the webview
            webviewView.webview.postMessage({
              type: 'keployConfig',
              config: config,
            });
          } catch (err) {
            vscode.window.showErrorMessage(`Error reading keploy.yml: ${err}`);
          }
        }
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
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open logs ${error}` });
          }
          break;
        }
        case 'startRecordingCommand': {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Recording button clicked');

            const bashScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "bash", "keploy_record_script.sh");
            const zshScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "zsh", "keploy_record_script.sh");
            const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "logs", "record_mode.log");
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


            await startRecording(wslscriptPath, wsllogPath, bashScript.fsPath, zshScript.fsPath, logfilePath.fsPath, this._view?.webview);
            this._view?.webview.postMessage({ type: 'success', value: 'Recording Started' });
            this._view?.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;
        }
        case 'stopRecordingCommand': {
          if (!data.value) {
            return;
          }
          try {
            console.log("Stopping recording");
            await stopRecording();

          }
          catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
          }
          break;
        }

        case 'startTestingCommand': {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Testing button clicked');
            const bashScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "bash", "keploy_test_script.sh");
            const zshScript = vscode.Uri.joinPath(this._extensionUri, "scripts", "zsh", "keploy_test_script.sh");
            const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "logs", "test_mode.log");
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
            await startTesting(wslscriptPath, wsllogPath, bashScript.fsPath, zshScript.fsPath, logfilePath.fsPath, this._view?.webview);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
          }
          break;
        }
        case 'stopTestingCommand': {
          if (!data.value) {
            return;
          }
          try {
            console.log("Stopping Testing");
            await stopTesting();
          }
          catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop Testing ${error}` });
          }
          break;
        }
        case "navigate": {
          if (!data.value) {
            return;
          }
          if (data.value === "google") {
            console.log('Navigate to Google');
            const response: any = await SignInWithGitHub();
            console.log('Response from SignIn', response);
          }
          try {
            console.log('Navigate to ' + data.value);
            let sveltePageJs: vscode.Uri;
            let sveltePageCss: vscode.Uri;

            if (data.value === 'UtgDocs') {
              sveltePageJs = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "UtgDocs.js")
              );
              sveltePageCss = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "UtgDocs.css")
              );
            } else if (data.value === "IntegrationTest") {

              //if config file is already present then navigate to keploy page
              const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
              const configFilePath = folderPath + '/keploy.yml';
              if (existsSync(configFilePath)) {
                sveltePageJs = webviewView.webview.asWebviewUri(
                  vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployHome.js")
                );
                sveltePageCss = webviewView.webview.asWebviewUri(
                  vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployHome.css")
                );
              } else {
                sveltePageJs = webviewView.webview.asWebviewUri(
                  vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "IntegrationTest.js")
                );
                sveltePageCss = webviewView.webview.asWebviewUri(
                  vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "IntegrationTest.css")
                );
              }

            } else if (data.value === 'Config') {

              sveltePageJs = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "Config.js")
              );
              sveltePageCss = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "Config.css")
              );
            }
            else if (data.value === 'Option') {
              sveltePageJs = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "Option.js")
              );
              sveltePageCss = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "Option.css")
              );
            } else if (data.value === 'KeployHome') {
              sveltePageJs = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployHome.js")
              );
              sveltePageCss = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployHome.css")
              );
            }else if(data.value = "KeployChatBot"){
              sveltePageJs = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployChat.js")
              );
              sveltePageCss = webviewView.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, "out", "compiled", "KeployChat.css")
              );
    
            }
            else {
              throw new Error("Unsupported navigation value");
            }

            // Save the language state
            // vscode.getState().then(() => {
            //   vscode.setState({ language: data.language });
            // });

            webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, sveltePageCss, sveltePageJs);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open page ${error}` });
          }
          break;
        }

        case "signinwithstate": {
          try {
            await vscode.commands.executeCommand('keploy.SignInWithOthers');
          } catch (error) {
            console.error('Error while signing in:', error);
            vscode.window.showErrorMessage('Failed to sign in. Please try again.');
          }
          break;
      }
      //cannot make it a case of generate unit test as we will taking the input from the user and keploy gen with additional prompts will from a cta hence making a new case for it.
        case "keployGenWithAdditionalPrompts":{
          try{
            const additional_prompts = data.prompt;
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showErrorMessage("No file is currently open.");
              return;
            }
      
            const fileUri = editor.document.uri;      
            console.log("additional prompts and uri: ", additional_prompts , fileUri);
            await vscode.commands.executeCommand('keploy.utg' , fileUri , additional_prompts );
          }catch(error){
            console.error("Error executing keploy.utg command:", error);
          }
          break;
        }
        case "progressStatus":{
          if(progressBarVisible == true && data.value == "false"){
            console.log("progressbarVisible and data value: ",progressBarVisible,data.value);
            await this._context.globalState.update("progressVisible", false);
          }

          break;
        }
        case "openLink": {

          try {
            console.log("Opening external link: " + data.url);
            vscode.env.openExternal(vscode.Uri.parse(data.url));
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open external link: ${error}` });
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

        case "viewCompleteSummary": {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Complete Summary...');
            const logfilePath = vscode.Uri.joinPath(this._extensionUri, "scripts", "logs", "test_mode.log");
            displayTestCases(logfilePath.fsPath, this._view?.webview, false, true);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open complete summary ${error}` });
          }
          break;

        }

        case "viewPreviousTestResults": {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Previous Test Results...');
            displayPreviousTestResults(this._view?.webview);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open previous test results ${error}` });
          }
          break;

        }

        case "aggregatedTestResults": {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Aggregated Test Results...');
            this._view?.webview.postMessage({ type: 'aggregatedTestResults', data: data.data, error: data.error, value: data.value });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open aggregated test results ${error}` });
          }
          break;

        }

        case "openConfigFile": {
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
        case "initialiseConfig": {
          if (!data.value) {
            return;
          }
          try {
            console.log('Initialising Config File...');
            handleInitializeKeployConfigFile(this._view?.webview, data.path, data.command);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to initialise config file ${error}` });
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
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open test file ${error}` });
          }
          break;
        }
        case "detectProjectType": {
          try {
            console.log('Detecting Project Type...');
            precheckFunction()
              .then(projectType => {
                console.log("Project type detected:", projectType);
                this._view?.webview.postMessage({ type: 'projectDetected', projectType: projectType });
              })
              .catch(error => {
                console.error("Error detecting project type:", error);
              });
          } catch (error) {
            console.log('Error in detecting project type', error);
          }
          break;
        }
        
        case "updateKeployConfig": {
          // Collect the updated data from the UI
          const newConfig: PartialKeployConfig = {
            appName: data.config.appName,
            command: data.config.command,
            containerName: data.config.containerName,
            networkName: data.config.networkName,
            test: {
              delay: data.config.test?.delay,
              apiTimeout: data.config.test?.apiTimeout,
              mongoPassword: data.config.test?.mongoPassword,
            },
          };

          // Call the function to update the YAML config
          await updateKeployYaml(newConfig);
          break;
        }

      }

    });
    
  }
  private _startApiResponseUpdates() {
    this._interval = setInterval(() => {
      const apiResponse = this._context.globalState.get<string>('apiResponse') || "No response";
      const signedIn = this._context.globalState.get<string>('SignedOthers') || "false";

      this._sendApiResponseToWebview(apiResponse, signedIn);
    }, 3000); // 3 seconds
  }

  // Stop the interval when the webview is no longer active
  public dispose() {
    if (this._interval) { 
      clearInterval(this._interval);
    }
  }

  // Helper function to send `apiResponse` to the webview
  private _sendApiResponseToWebview(apiResponse: string, signedIn: string) {
    if (this._view) {
      // console.log("api response withing 3 seconds" , apiResponse);
      this._view.webview.postMessage({
        type: 'apiResponse',
        value: apiResponse,
      });

      this._view.webview.postMessage({
        type: 'signedIn',
        value: signedIn,
      });

      const progressBarVisible = this._context.globalState.get<boolean>('progressVisible') ?? true;


      this._view.webview.postMessage({
        type: 'progressBarStatus',
        value: progressBarVisible,
      });

    }
  }
  public revive(panel: vscode.WebviewView) {
    this._view = panel;
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

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();
    //read the global state to check if the user is signed in


    // webview.postMessage({ type: 'displayPreviousTestResults', value: 'Displaying Previous Test Results' });
    // const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts","logs", "test_mode.log");
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
      <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap" rel="stylesheet"> 
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