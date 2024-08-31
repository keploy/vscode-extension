import * as vscode from 'vscode';
import { readFileSync, appendFile } from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';
import * as path from 'path';

function extractTestSetName(logContent: string) {
    // Define the regular expression pattern to find the test set name
    const regex = /Keploy has captured test cases for the user's application\.\s*{"path": ".*\/(test-set-\d+)\/tests"/;
  
    // Execute the regular expression on the log content
    const match = regex.exec(logContent);
  
    // Check if a match was found and return the test set name, otherwise return null
    return match ? match[1] : null;
}

export async function displayRecordedTestCases(logfilePath: string, webview: any): Promise<void> {
    console.log('Displaying Recorded test cases');
    let logData;
    try {
        try {
            logData = readFileSync(logfilePath, 'utf8');
        }
        catch (error) {
            appendFile(logfilePath, "", function (err) {
                if (err) { console.log("err here" +  err); }
            });
            logData = readFileSync(logfilePath, 'utf8');
        }

        const testSetName = extractTestSetName(logData);
        // Split the log data into lines
        const logLines = logData.split('\n');
        // Filter out the lines containing the desired information
        const capturedTestLines = logLines.filter(line => line.includes('🟠 Keploy has captured test cases'));
        // Display the captured test cases in your frontend
        if (capturedTestLines.length === 0) {
            webview.postMessage({
                type: 'testcaserecorded',
                value: 'Test Case has been recorded',
                textContent: "No test cases captured. Please try again.",
                noTestCases: true
            });
            return;
        }
        capturedTestLines.forEach(testLine => {
            const testCaseInfo = JSON.parse(testLine.substring(testLine.indexOf('{')));
            const textContent = `"${testCaseInfo['testcase name']}"`;
            const path = testCaseInfo.path + '/' + testCaseInfo['testcase name'] + '.yaml';
            webview.postMessage({
                type: 'testcaserecorded',
                value: 'Test Case has been recorded',
                textContent: textContent,
                path: path,
                testSetName: testSetName
            });
        });
    }
    catch(error){
        console.log(error);
        webview.postMessage({
            type: 'testcaserecorded',
            value: 'Test Case has been recorded',
            textContent: error,
            error: true
        });
        vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
        throw error;
    }
}

export async function stopRecording(){
    try{
        vscode.window.activeTerminal?.sendText('\x03', true);
        //set timeout for 5 seconds
        setTimeout(() => {
            vscode.window.activeTerminal?.dispose();
        }, 5000);

    return;
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

export async function startRecording(wslscriptPath: string, wsllogfilePath: string, bashScriptPath: string, zshScriptPath: string, logfilePath: string, webview: any): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let terminalPath: string;
                let currentShell = '';

                if (process.platform === 'win32') {
                    terminalPath = 'wsl.exe';
                } else {
                    terminalPath = '/bin/bash';
                    currentShell = process.env.SHELL || '';
                    if (!currentShell) {
                        currentShell = child_process.execSync('echo $SHELL', { encoding: 'utf8' }).trim();
                    }
                    console.log(`Current default shell: ${currentShell}`);
                }
                console.log(`Terminal path: ${terminalPath}`);
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: terminalPath,
                });
                terminal.show();

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage('No active editor found');
                    reject(new Error('No active editor found'));
                    return;
                }

                const document = editor.document;
                const filePath = document.uri.fsPath;
                let recordCmd: string;

                if (filePath.endsWith('.go')) {
                    // For Go files
                    const packageName = path.basename(path.dirname(filePath));
                    recordCmd = `keploy record -c "go run ${filePath}" --delay 5 > "${logfilePath}"`;
                } else {
                    // For JS/TS files
                    if (process.platform === 'win32') {
                        recordCmd = `${wslscriptPath} "${wsllogfilePath}" ;exit 0`;
                    } else {
                        if (currentShell.includes('zsh')) {
                            recordCmd = `"${zshScriptPath}" "${logfilePath}" `;
                        } else {
                            recordCmd = `"${bashScriptPath}" "${logfilePath}" ;exit 0`;
                        }
                    }
                }

                console.log(recordCmd);
                terminal.sendText(recordCmd);

                // Listen for terminal close event
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose(); // Dispose the listener
                        displayRecordedTestCases(logfilePath, webview); // Call function when terminal is closed
                        resolve(); // Resolve the promise
                    }
                });

            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
                reject(error);
            }
        });
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
        throw error;
    }
}