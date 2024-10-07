import * as vscode from 'vscode';
import {getKeployVersion , getCurrentKeployVersion} from './version';
import * as Sentry from './sentryInit';
import * as child_process from 'child_process';

export async function downloadAndUpdate(): Promise<void> {
    try {
        const keployVersion = await getCurrentKeployVersion();
        const latestVersion = await getKeployVersion();
        // Remove "v" from the beginning of the latest version string, if present
        const formattedLatestVersion = latestVersion.startsWith('v') ? latestVersion.substring(1) : latestVersion;

        console.log('Latest Keploy version:', formattedLatestVersion);

        if (keployVersion === formattedLatestVersion) {
            vscode.window.showInformationMessage('Keploy is already up to date');
            return;
        }

        console.log('Downloading and updating Keploy binary...');
        vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
        downloadAndInstallKeployBinary().then(() => {
            vscode.window.showInformationMessage('Updated Keploy binary successfully!');
        }
        ).catch(error => {

            console.error('Failed to update Keploy binary:', error);
            vscode.window.showErrorMessage('Failed to update Keploy binary oh no: ' + error);
            throw error;
        }
        );
        
    } catch (error : any) {
        if (error.toString().toLowerCase().includes("not found") || error.toString().toLowerCase().includes("command not found") || error.toString().toLowerCase().includes("no such file or directory")){
            //post message to webview
            // webview.postMessage({ type: 'onError', value: `Keploy binary not found. Installing Keploy binary first.` });
            downloadAndInstallKeployBinary().then(() => {
                vscode.window.showInformationMessage('Updated Keploy binary successfully!');
            }
            ).catch(error => {
                console.error('Failed to update Keploy binary here:', error);
                vscode.window.showErrorMessage('Failed to update Keploy binary: ' + error);
                throw error;
            }
            );
        }else{
        console.error('Error occurred during download and update:', error);
        vscode.window.showErrorMessage('Error occurred during updating binary: ' + error);
        Sentry?.default?.captureException(error);
        throw error;
        }
    }
}

export async function downloadAndUpdateDocker(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
        console.log('Downloading and updating Keploy Docker image...');
        let bashPath: string;
            if (process.platform === 'win32') {
                // If on Windows, use the correct path to WSL's Bash shell
                bashPath = 'wsl.exe';
            } else {
                // Otherwise, assume Bash is available at the standard location
                bashPath = '/bin/bash';
            }
        const terminal = vscode.window.createTerminal({
            name: 'Keploy Terminal',
            shellPath: bashPath
        });

        // Show the terminal
        terminal.show();

        const dockerCmd = 'docker pull ghcr.io/keploy/keploy:latest ; exit 0';
        terminal.sendText(dockerCmd);
        vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
            // Listen for terminal close event
            const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                console.log('Terminal closed');
                if (eventTerminal === terminal) {
                    disposable.dispose(); // Dispose the listener
                    resolve(); 
                }
            });
    
        }   catch (error) {
            Sentry?.default?.captureException(error);
            throw error;
            // reject(error); // Reject the promise if an error occurs during execution
            
        }
    }
        );
    }
    
export async function downloadAndInstallKeployBinary(): Promise<void> {
    console.log('Downloading and installing Keploy binary...');
    return new Promise<void>((resolve, reject) => {

        try {
            const curlCmd = `curl --silent -L https://keploy.io/install.sh -o /tmp/install.sh && chmod +x /tmp/install.sh && /tmp/install.sh -noRoot`;

            child_process.exec(curlCmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error during installation: ${error.message}`);
                    reject(error);
                    vscode.window.showErrorMessage('Failed to update Keploy binary: ' + error);
                    return;
                }
                resolve();
                vscode.window.showInformationMessage('Updated Keploy binary successfully!');
            });

            vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
        } catch (error) {
            reject(error); // Reject the promise if an error occurs during execution
            Sentry?.default?.captureException(error);
        }
    });
}
