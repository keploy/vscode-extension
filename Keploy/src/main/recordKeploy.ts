import * as vscode from 'vscode';
import { readFileSync, appendFile } from 'fs';

export async function startRecording(
    command: string,
    folderPath: string,
    generatedRecordCommand: string,
    wslscriptPath: string,
    wsllogfilePath: string,
    scriptPath: string,
    logfilePath: string,
    webview: any
): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let shellPath: string;
                let recordCmd: string;
                
                if (process.platform === 'win32') {
                    shellPath = 'wsl.exe';
                    recordCmd = `${wslscriptPath} "${wsllogfilePath}" "${folderPath}" "${generatedRecordCommand}"; exit 0`;
                } else {
                    shellPath = '/bin/bash';
                    recordCmd = `sudo ${scriptPath} "${logfilePath}" "${folderPath}" "${generatedRecordCommand}"; exit 0`;
                }

                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: shellPath,
                });
                terminal.show();
                terminal.sendText(recordCmd);
                resolve();
            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage('Error occurred: ' + error);
                reject(error);
            }
        });
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred: ' + error);
        throw error;
    }
}

export async function testDisplay(logfilePath: string, webview: any): Promise<void> {
    console.log('Displaying test cases');
    let logData;
    try {
        try {
            logData = readFileSync(logfilePath, 'utf8');
        } catch (error) {
            appendFile(logfilePath, "", function (err) {
                if (err) { console.log("err here" + err); }
            });
            logData = readFileSync(logfilePath, 'utf8');
        }
        const logLines = logData.split('\n');
        const capturedTestLines = logLines.filter(line => line.includes('Captured test cases'));
        if (capturedTestLines.length === 0) {
            webview.postMessage({
                type: 'testcaserecorded',
                value: 'Test Case recorded',
                textContent: "Please try again.",
                noTestCases: true
            });
            return;
        }
    } catch (error) {
        console.log(error);
        webview.postMessage({
            type: 'testcaserecorded',
            value: 'Test recorded',
        });
        vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
        throw error;
    }
}
