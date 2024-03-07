import * as vscode from 'vscode';
import { execShell } from './execShell';
import getKeployVersion from './version';

export async function downloadAndUpdate(downloadUrl: string , webview : any): Promise<void> {
    try {
        const output = await execShell('/usr/local/bin/keploybin --version');
        const keployIndex = output.indexOf('Keploy');
        let keployVersion = '';
        if (keployIndex !== -1) {
            keployVersion = output.substring(keployIndex + 'Keploy'.length).trim();
        }

        console.log('Current Keploy version:', keployVersion);
        if (!keployVersion) {
            vscode.window.showErrorMessage('You dont have Keploy installed. Please install Keploy first');
            return;
        }
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
        downloadAndInstallKeployBinary(downloadUrl, webview).then(() => {
            vscode.window.showInformationMessage('Updated Keploy binary successfully!');
        }
        ).catch(error => {
            console.error('Failed to update Keploy binary:', error);
            vscode.window.showErrorMessage('Failed to update Keploy binary: ' + error);
            throw error;
        }
        );
        
    } catch (error : any) {
        if (error.toString().includes("keploybin: not found")) {
            //post message to webview
            webview.postMessage({ type: 'onError', value: `Keploy binary not found. Installing Keploy binary first.` });
            downloadAndInstallKeployBinary(downloadUrl, webview).then(() => {
                vscode.window.showInformationMessage('Updated Keploy binary successfully!');
            }
            ).catch(error => {
                console.error('Failed to update Keploy binary:', error);
                vscode.window.showErrorMessage('Failed to update Keploy binary: ' + error);
                throw error;
            }
            );
        }else{
        console.error('Error occurred during download and update:', error);
        vscode.window.showErrorMessage('Error occurred during updating binary: ' + error);
        throw error;
        }
    }
}

export async function downloadAndUpdateDocker(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        console.log('Downloading and updating Keploy Docker image...');
        const dockerCmd = 'docker pull ghcr.io/keploy/keploy:latest';
        execShell(dockerCmd).then(() => {
            vscode.window.showInformationMessage('Updated Keploy Docker image successfully!');
            resolve();
        }).catch(error => {
            console.error('Failed to update Keploy Docker image:', error);
            vscode.window.showErrorMessage('Failed to update Keploy Docker image: ' + error);
            reject(error);
        }
        );
    }
    );
}

export async function downloadAndInstallKeployBinary(downloadUrl : string , webview : any): Promise<void> {
    console.log('Downloading and installing Keploy binary...');
    return new Promise<void>((resolve, reject) => {

        let aliasPath = "/usr/local/bin/keploybin";
        try {
            let bashPath: string;
            if (process.platform === 'win32') {
                // If on Windows, use the correct path to WSL's Bash shell
                bashPath = 'wsl.exe';
            } else {
                // Otherwise, assume Bash is available at the standard location
                bashPath = '/bin/bash';
            }
            // Create a new terminal instance with the Bash shell
            const terminal = vscode.window.createTerminal({
                name: 'Keploy Terminal',
                shellPath: bashPath
            });

            // Show the terminal
            terminal.show();

            const curlCmd = `curl --silent --location ${downloadUrl} | tar xz -C /tmp `;
            const moveCmd = `sudo mv /tmp/keploy ${aliasPath}`;

            // Execute commands asynchronously
            const executeCommand = async (command: string) => {
                return new Promise<void>((resolve, reject) => {
                    terminal.sendText(command);
                    // terminal.sendText('echo $?'); // Output the exit status
                    // (window as any).onDidWriteTerminalData((event: any) => console.log(event.data.trim()))
                    setTimeout(() => resolve(), 8000); // Assuming commands will complete within 3 seconds
                    //we need to figure out a way to find out if command is completed successfully or not
                });
            };

            // Execute commands sequentially
            Promise.all([
                executeCommand(curlCmd),
                executeCommand(moveCmd)
            ]).then(() => {
                // Display an information message
                vscode.window.showInformationMessage('Downloading and updating Keploy binary...');
                resolve(); // Resolve the promise if all commands succeed
            }).catch(error => {
                reject(error); // Reject the promise if any command fails
            });
        } catch (error) {
            reject(error); // Reject the promise if an error occurs during execution
        }
    });
}

        
