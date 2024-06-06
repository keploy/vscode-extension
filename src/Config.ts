import * as vscode from 'vscode';
import { existsSync, readFileSync } from 'fs';

export async function handleOpenKeployConfigFile(webview: any) {
  const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const configFilePath = folderPath + '/keploy.yml';

  // Check if the file exists
  if (!existsSync(configFilePath)) {
    webview.postMessage({ type: 'configNotFound', value: 'Config file not found in the current workspace.' });
    return;
  }

  // Read the config file content
  const configFileContent = readFileSync(configFilePath, 'utf8');
  
  // Define the comment to check for
  const initComment = "# This config file has been initialized";

  // Check if the comment is present at the end of the file
  const isInitialized = configFileContent.trim().endsWith(initComment);

  if (!isInitialized) {
    webview.postMessage({ type: 'configUninitialized', value: 'Config file is not initialized. Please initialize the config file.' });
    return;
  }

  // Open the config file in the editor
  vscode.workspace.openTextDocument(configFilePath).then(doc => {
    vscode.window.showTextDocument(doc, { preview: false });
  });
}


export async function handleInitializeKeployConfigFile(webview: any, path: string, command: string) {
  console.log('Initializing config file');
  
    const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const configFilePath = folderPath + '/keploy.yml';


  // Initialize the config file with the provided path and command
  const initContent = `
path: "${path}"
appId: ""
command: "${command}"
port: 0
proxyPort: 16789
dnsPort: 26789
debug: false
disableANSI: false
disableTele: false
inDocker: false
generateGithubActions: true
containerName: ""
networkName: ""
buildDelay: 30
test:
  selectedTests: {}
  globalNoise:
    global: {}
    test-sets: {}
  delay: 5
  apiTimeout: 5
  coverage: false
  goCoverage: false
  coverageReportPath: ""
  ignoreOrdering: true
  mongoPassword: "default@123"
  language: ""
  removeUnusedMocks: false
record:
  recordTimer: 0s
  filters: []
configPath: ""
bypassRules: []
cmdType: "native"
enableTesting: false
fallbackOnMiss: false
keployContainer: "keploy-v2"
keployNetwork: "keploy-network"

# This config file has been initialized
  `;

  // Write the content to the config file
  await vscode.workspace.fs.writeFile(vscode.Uri.file(configFilePath), Buffer.from(initContent));
  
  // Open the config file in the editor
  vscode.workspace.openTextDocument(configFilePath).then(doc => {
    vscode.window.showTextDocument(doc, { preview: false });
  });
}

  