import * as vscode from 'vscode';
import { readFileSync  , appendFile} from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';
import { SentryInstance } from './sentryInit';

function extractTestSetName(logContent: string) {
    // Define the regular expression pattern to find the test set name
    const regex = /Keploy has captured test cases for the user's application\.\s*{"path": ".*\/(test-set-\d+)\/tests"/;
  
    // Execute the regular expression on the log content
    const match = regex.exec(logContent);
  
    // Check if a match was found and return the test set name, otherwise return null
    return match ? match[1] : null;
  }
export async function displayRecordedTestCases(logfilePath: string, webview: any): Promise<void> {
    console.log('Displaying Recorded test  cases');
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
    });}
    catch(error){
        console.log(error);
        webview.postMessage({
            type: 'testcaserecorded',
            value: 'Test Case has been recorded',
            textContent: error,
            error: true
        });
        SentryInstance?.captureException(error);
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
        SentryInstance?.captureException(error);
        console.log(error);
        throw error;
    }
}


export async function startRecording( wslscriptPath: string, wsllogfilePath: string, bashScriptPath: string, zshScriptPath : string ,  logfilePath: string, webview: any): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let terminalPath: string;
                let currentShell ='';

                if (process.platform === 'win32') {
                    terminalPath = 'wsl.exe';
                } else {
                    terminalPath = '/bin/bash';
                    // Get the default shell for the current user
                    currentShell = process.env.SHELL || '';

                    if (!currentShell) {
                        // Fallback method if process.env.SHELL is not set
                        currentShell = child_process.execSync('echo $SHELL', { encoding: 'utf8' }).trim();
                    }

                    console.log(`Current default shell: ${currentShell}`);
                    //uncomment the below line if you want to use the default shell (for zsh test)
                    // terminalPath = currentShell; 
                }
                console.log(`Terminal path: ${terminalPath}`);
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: terminalPath,
                });
                terminal.show();
                if (process.platform === 'win32') {
                    const recordCmd = `${wslscriptPath} "${wsllogfilePath}" ;exit 0`;
                    terminal.sendText(recordCmd);
                } else {
                    let recordCmd: string;
                    if (currentShell.includes('zsh')) {
                        // Use a Zsh-specific script if needed
                        //replace bashScriptPath with zshScriptPath for zsh
                        recordCmd = `"${bashScriptPath}" "${logfilePath}" `;
                    } else {
                        // Default to Bash script
                        recordCmd = `"${bashScriptPath}" "${logfilePath}" ;exit 0`;
                    }
                    console.log(recordCmd);
                    terminal.sendText(recordCmd);
                }

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
                SentryInstance?.captureException(error);
                vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
                reject(error);
            }
        });
    } catch (error) {
        console.log(error);
        SentryInstance?.captureException(error);
        vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
        throw error;
    }
}