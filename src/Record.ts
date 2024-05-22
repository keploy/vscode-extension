import * as vscode from 'vscode';
import { readFileSync  , appendFile} from 'fs';

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
        const textContent = `Test case "${testCaseInfo['testcase name']}"`;
        const path = testCaseInfo.path + '/' + testCaseInfo['testcase name'] + '.yaml';
        webview.postMessage({
            type: 'testcaserecorded',
            value: 'Test Case has been recorded',
            textContent: textContent,
            path: path
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

export async function startRecording(command: string, folderPath: string, generatedRecordCommand: string, wslscriptPath: string, wsllogfilePath: string ,scriptPath: string, logfilePath: string, webview: any): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let bashPath: string;
                if (process.platform === 'win32') {
                    bashPath = 'wsl.exe';
                } else {
                    bashPath = '/bin/bash';
                }
                //remove keploy from the command
                // generatedRecordCommand = generatedRecordCommand.replace('keploy', '');
                command = "record -c " + command;
                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: bashPath,
                });

                terminal.show();
                if (process.platform === 'win32'){
                    const recordCmd = `${wslscriptPath} "${wsllogfilePath}" "${folderPath}" "${command}";  `;
                    terminal.sendText(recordCmd);
                }
                else{
                    const recordCmd = `"${scriptPath}" "${logfilePath}" "${folderPath}" "${command}"`;
                    console.log(recordCmd);
                // const exitCmd = 'exit';
                terminal.sendText(recordCmd);
                }
                
                
                // terminal.sendText('exit', true);

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
    }
    catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy Record: ' + error);
        throw error;
    }
}

