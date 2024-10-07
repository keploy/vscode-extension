import * as vscode from 'vscode';
import { existsSync, readFileSync } from 'fs';
import * as Sentry from './sentryInit';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { writeFileSync } from 'fs';
export interface PartialKeployConfig {
  appName:string;
  command:string;
  containerName:string;
  networkName: string;
  test: {
    delay: number;
    apiTimeout: number;
    mongoPassword: string;
  };
}

// Function to update keploy.yaml
export async function updateKeployYaml(newConfig: PartialKeployConfig) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
  }

  const keployFilePath = path.join(workspaceFolders[0].uri.fsPath, 'keploy.yml');

  if (!existsSync(keployFilePath)) {
      vscode.window.showErrorMessage('keploy.yaml file not found');
      return;
  }

  try {
      const fileContents = readFileSync(keployFilePath, 'utf8');
      const config = yaml.load(fileContents) as any;  // Load the YAML content into an object
      console.log('config', config);
      config.appName = newConfig.appName;
      config.command = newConfig.command;
      config.containerName = newConfig.containerName;
      config.networkName = newConfig.networkName;
      config.test.delay = newConfig.test.delay;
      config.test.apiTimeout = newConfig.test.apiTimeout;
      config.test.mongoPassword = newConfig.test.mongoPassword;

      // Convert the updated config object back to YAML format
      const newYamlContent = yaml.dump(config);
      writeFileSync(keployFilePath, newYamlContent, 'utf8');

      vscode.window.showInformationMessage('Keploy config updated successfully!');
  } catch (error) {
      vscode.window.showErrorMessage(`Failed to update keploy.yaml: ${error}`);
  }
}

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
}

// Function to update keploy.yaml
export async function updateKeployYaml(newConfig: PartialKeployConfig) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
  }

  const keployFilePath = path.join(workspaceFolders[0].uri.fsPath, 'keploy.yml');

  if (!existsSync(keployFilePath)) {
      vscode.window.showErrorMessage('keploy.yaml file not found');
      return;
  }

  try {
      const fileContents = readFileSync(keployFilePath, 'utf8');
      const config = yaml.load(fileContents) as any;  // Load the YAML content into an object
      console.log('config', config);
      config.appName = newConfig.appName;
      config.command = newConfig.command;
      config.containerName = newConfig.containerName;
      config.networkName = newConfig.networkName;
      config.test.delay = newConfig.test.delay;
      config.test.apiTimeout = newConfig.test.apiTimeout;
      config.test.mongoPassword = newConfig.test.mongoPassword;

      // Convert the updated config object back to YAML format
      const newYamlContent = yaml.dump(config);
      writeFileSync(keployFilePath, newYamlContent, 'utf8');

      vscode.window.showInformationMessage('Keploy config updated successfully!');
  } catch (error) {
      vscode.window.showErrorMessage(`Failed to update keploy.yaml: ${error}`);
  }
}

export async function handleOpenKeployConfigFile(webview: any) {
  try {
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
      webview.postMessage({ type: 'configNotFound', value: 'Config file could not be generated.' });
    }

  } catch (error) {
    // Log the error to Sentry
    Sentry?.default?.captureException(error);
    vscode.window.showErrorMessage('An error occurred while handling the Keploy config file.');
  }
}

export async function handleInitializeKeployConfigFile(webview: any, path: string, command: string) {
  try {
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
    
    console.log('finalContent', finalContent);
    webview.postMessage({ type: 'navigateToHome', value: 'KeployHome' });

  } catch (error) {
    // Log the error to Sentry
    Sentry?.default?.captureException(error);
    vscode.window.showErrorMessage('An error occurred while initializing the Keploy config file.');
  }
}
