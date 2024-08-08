import * as vscode from 'vscode';
import { existsSync, readFileSync } from 'fs';

export async function handleOpenKeployConfigFile(webview: any) {
  const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const configFilePath = folderPath + '/keploy.yml';

  // Function to check if the config file exists
  const checkConfigExists = () => {
    return existsSync(configFilePath);
  };

  // Function to open the config file in the editor
  const openConfigFile = () => {
    vscode.workspace.openTextDocument(configFilePath).then(doc => {
      vscode.window.showTextDocument(doc, { preview: false });
    });
  };

  // Check if the config file exists
  if (checkConfigExists()) {
    openConfigFile();
    return;
  }

  // Create a terminal and execute 'keploy config --generate'
  const terminal = vscode.window.createTerminal('Keploy Config Generator');
  terminal.sendText('keploy config --generate; exit 0');
  terminal.show();

  // Polling function to check if the config file is created
  const checkFileExists = () => {
    return new Promise<boolean>((resolve) => {
      const interval = setInterval(() => {
        if (checkConfigExists()) {
          clearInterval(interval);
          resolve(true);
        }
      }, 2000); // Check every 2 seconds
    });
  };

  // Wait for the config file to be created
  const fileExists = await checkFileExists();

  if (!fileExists) {
    // webview.postMessage({ type: '', value: 'KeployHome' });
  
    webview.postMessage({ type: 'configNotFound', value: 'Config file could not be generated.' });
  }
}

export async function handleInitializeKeployConfigFile(webview: any, path: string, command: string) {
  console.log('Initializing config file');

  const folderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const configFilePath = `${folderPath}/keploy.yml`;

  if (path === '') {
    path = "./";
  }

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
enableTesting: false
fallbackOnMiss: false

# This config file has been initialized
  `;

  const finalContent = `${initContent.trim()}

# Visit https://keploy.io/docs/running-keploy/configuration-file/ to learn about using Keploy through the configuration file.
  `;

  // Write the content to the config file
  await vscode.workspace.fs.writeFile(vscode.Uri.file(configFilePath), Buffer.from(finalContent));

  // Open the config file in the editor
  vscode.workspace.openTextDocument(configFilePath).then(doc => {
    vscode.window.showTextDocument(doc, { preview: false });
  });
  webview.postMessage({ type: 'navigateToHome', value: 'KeployHome' });
}
