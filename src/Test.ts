import * as vscode from 'vscode';
import { readFileSync, appendFile } from 'fs';

export async function displayTestCases(logfilePath: string, webview: any): Promise<void> {
    console.log('Displaying test cases');
    let logData;
    try {
        try {
            logData = readFileSync(logfilePath, 'utf8');
        }
        catch (error) {
            appendFile(logfilePath, "", function (err) {
                if (err) { console.log("err here " +  err); }
            });
            logData = readFileSync(logfilePath, 'utf8');
        }
        // console.log(logData);
        // Split the log data into lines
        const logLines = logData.split('\n');
        // Filter out the lines containing the desired information
        // Find the index of the line containing the start of the desired part
        const startIndex = logLines.findIndex(line => line.includes('COMPLETE TESTRUN SUMMARY.'));
        if (startIndex === -1) {
            console.log('Start index not found');
            webview.postMessage({
                type: 'testResults',
                value: 'Test Failed',
                textSummary: "Error Replaying Test Cases. Please try again."
            });
            return;
        }

        // Find the index of the line containing the end of the desired part
        const endIndex = logLines.findIndex((line, index) => index > startIndex && line.includes('<=========================================>'));
        if (endIndex === -1) {
            console.log('End index not found');
            webview.postMessage({
                type: 'testResults',
                value: 'Test Failed',
                textSummary: "Error Replaying Test Cases. Please try again."
            });
            return;
        }

        // Extract the desired part
        const testSummary = logLines.slice(startIndex, endIndex + 1).join('\n');
        // Display the captured test cases in your frontend
        if (testSummary.length === 0) {
            webview.postMessage({
                type: 'testResults',
                value: 'Test Failed',
                textSummary: "Error Replaying Test Cases. Please try again."
            });
            return;
        }
        //remove ansi escape codes
        const ansiRegex = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        const cleanSummary = testSummary.replace(ansiRegex, '');
        console.log(cleanSummary);
        const testSummaryList = cleanSummary.split('\n');
        console.log(testSummaryList);
        //remove last line of summary which is pattern
        testSummaryList.pop();
        testSummaryList.forEach((line, index) => {
            webview.postMessage({
                type: 'testResults',
                value: 'Test Summary Generated',
                textSummary: line
            });
        }); 
        
        // webview.postMessage({
        //         type: 'testResults',
        //         value: 'Test Summary Generated',
        //         textSummary: cleanSummary
        //     });
            // recordedTestCasesDiv.appendChild(testCaseElement);
        }
    catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy Test: ' + error);
        throw error;
    }
}


export async function startTesting(command: string, filepath: string,wslscriptPath: string, wsllogfilePath: string, scriptPath: string, logfilePath: string, webview: any): Promise<void> {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                let bashPath: string;
                if (process.platform === 'win32') {
                    bashPath = 'wsl.exe';
                } else {
                    bashPath = '/bin/bash';
                }

                const terminal = vscode.window.createTerminal({
                    name: 'Keploy Terminal',
                    shellPath: bashPath,
                });

                terminal.show();
                if (process.platform === 'win32') {
                    const testCmd = `${wslscriptPath} "${command}" "${filepath}" "${wsllogfilePath}" ;exit 0 `;
                    terminal.sendText(testCmd);
                }
                else{
                const testCmd = `sudo ${scriptPath} "${command}" "${filepath}" "${logfilePath}" ;exit 0 `;
                // const exitCmd = 'exit';
                terminal.sendText(testCmd);
                }
                // terminal.sendText('exit', true);

                // Listen for terminal close event
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose(); // Dispose the listener
                        displayTestCases(logfilePath, webview); // Call function when terminal is closed
                        resolve(); // Resolve the promise
                    }
                });

            } catch (error) {
                console.log("error is " + error);
                vscode.window.showErrorMessage('Error occurred Keploy Test: ' + error);
                reject(error);
            }
        });
    }
    catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy Test: ' + error);
        throw error;
    }
}

export async function stopTesting(): Promise<void> {
    try {
        vscode.window.activeTerminal?.dispose();
        return;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}
