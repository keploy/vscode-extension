import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as Sentry from './sentryInit';
import axios, { AxiosResponse } from 'axios';
import { addBreadcrumb } from '@sentry/browser';


async function Utg(context: vscode.ExtensionContext) {
    
    try {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const token  = await context.globalState.get<'string'>('JwtToken');

                let apiResponse: string = '';
                const terminal = vscode.window.createTerminal("Keploy Terminal");
                addBreadcrumb({ message: 'Keploy Terminal Created', level: 'info' });
                terminal.show();

                const editor = vscode.window.activeTextEditor;
                let currentFilePath = "";

                if (editor) {
                    const document = editor.document;
                    currentFilePath = document.uri.fsPath;
                    vscode.window.showInformationMessage(`Current opened file: ${currentFilePath}`);
                    addBreadcrumb({ message: `Opened file: ${currentFilePath}`, level: 'info' });
                } else {
                    vscode.window.showInformationMessage('No file is currently opened.');
                    return;
                }

                const scriptPath = path.join(context.extensionPath, 'scripts', 'utg.sh');
                const sourceFilePath = currentFilePath;

                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showErrorMessage('No workspace is opened.');
                    return;
                }

                const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const extension = path.extname(sourceFilePath);
                let testFilePath: string;
                let command: string;
                let coverageReportPath: string;
                let testFileContent: string;

                // Detect the file type and execute respective test
                if (extension === '.js' || extension === '.ts') {
                    testFilePath = path.join(path.join(rootDir, 'test'), path.basename(sourceFilePath).replace(extension, `.test${extension}`));                   
                    if (!fs.existsSync(testFilePath)) {
                        vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                        fs.writeFileSync(testFilePath, `// Test file for ${testFilePath}`);
                    }
                    command = `npm test -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage`;
                    coverageReportPath = "./coverage/cobertura-coverage.xml";
                } else if (extension === '.py') {
                    const testDir = path.join(rootDir,'test');
                    testFilePath = path.join(testDir,'test_'+ path.basename(sourceFilePath));
                    if (!fs.existsSync(testFilePath)) {
                        vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                        fs.writeFileSync(testFilePath, `// Test file for ${testFilePath}`);
                    }
                    console.log(sourceFilePath , testFilePath , "python wala");
                    command = `pytest --cov=${path.basename(sourceFilePath,'.py')} --cov-report=xml:coverage.xml ${testFilePath}`;
                    coverageReportPath = "./coverage.xml";
                } else if (extension === '.java') {
                    const testDir = path.join(rootDir, 'src', 'test', 'java');
                    const testFileName = path.basename(sourceFilePath).replace('.java', 'Test.java');
                    testFilePath = path.join(testDir, testFileName);

                    if (!fs.existsSync(testFilePath)) {
                        vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                        fs.writeFileSync(testFilePath, `// Test file for ${testFilePath}`);
                    }
                    command = `mvn clean test jacoco:report`;
                    coverageReportPath = "./target/site/jacoco/jacoco.xml";
                } else if (extension === '.go') {
                    testFilePath = path.join(rootDir, path.basename(sourceFilePath).replace('.go', '_test.go'));
                    console.log(testFilePath , "in the go block");
                    if (!fs.existsSync(testFilePath)) {
                        vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                        const uniqueFuncName = path.basename(sourceFilePath).replace('.go', 'Test');
                        testFileContent = `package main\n\nimport "testing"`;
                        fs.writeFileSync(testFilePath, testFileContent);                    }
                    command = `go test -v ./... -coverprofile=coverage.out && gocov convert coverage.out | gocov-xml > coverage.xml`;
                    coverageReportPath = "./coverage.xml";
                } else {
                    vscode.window.showErrorMessage(`Unsupported file type: ${extension}`);
                    Sentry?.default?.captureMessage(`Unsupported file type: ${extension}`, 'error');
                    return;
                }

                terminal.sendText(`sh "${scriptPath}" "${sourceFilePath}" "${testFilePath}" "${coverageReportPath}" "${command}";`);
                addBreadcrumb({ message: `Test script executed for ${sourceFilePath}`, level: 'info' });

                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await delay(5000);

                try {
                    if (token) {
                        apiResponse = await makeApiRequest(token) || 'no response';
                        const response = JSON.parse(apiResponse);
                        await context.globalState.update('apiResponse', apiResponse);
                        if (response.usedCall === response.totalCall) {
                            await context.globalState.update('SubscriptionEnded', true);
                        }
                    } else {
                        console.log("Token not found");
                    }
                } catch (apiError) {
                    vscode.window.showErrorMessage('Error during API request: ' + apiError);
                    Sentry?.default?.captureException(apiError);
                }

                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    if (eventTerminal === terminal) {
                        addBreadcrumb({ message: 'Keploy Terminal closed', level: 'info' });
                        disposable.dispose();
                        resolve();
                    }
                });

            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage('Error occurred Keploy UTG: ' + error);
                Sentry?.default?.captureException(error);
                reject(error);
            }
        });
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy UTG: ' + error);
        Sentry?.default?.captureException(error);
        throw error;
    }
}

// Separate function for making the API request using axios
export async function makeApiRequest(token:string): Promise<string | null> {
    const url = 'https://api.keploy.io/ai/call/count123';

    try {
        const response: AxiosResponse = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return JSON.stringify(response.data);  // Return the API response data as a string
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle axios-specific error
            Sentry?.default?.captureException(error);
            console.log(`API call failed: ${error.message}`);
        } else {
            // Handle oth   er errors (in case they are not Axios errors)
            Sentry?.default?.captureException(error);
            console.log('An unknown error occurred.');
        }

        return null;  // Return null in case of error
    }
}

// Ensure test file exists
async function ensureTestFileExists(sourceFilePath: string , DirectoryPath:string ): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('No workspace is opened.');
        return;
    }

    // const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath; // Root directory of the project
    const extension = path.extname(sourceFilePath);
    const sourceDir = path.dirname(sourceFilePath); // Directory of the source file
    let testDir = path.join(DirectoryPath, 'test'); // 'test' directory under the source directory
    const sourceFileName = path.basename(sourceFilePath);
    let testFileName: string;
    let testFileContent = '';

    if (extension === '.js' || extension === '.ts') {
        testFileName = sourceFileName.replace(extension, `.test${extension}`);
    } else if (extension === '.py') {
        testDir = DirectoryPath;
        testFileName = "test_" + sourceFileName;
    } else if (extension === '.java') {
        testFileName = sourceFileName.replace('.java', 'Test.java');
    } else if (extension === '.go') {
        testDir = DirectoryPath;
        testFileName = sourceFileName.replace('.go', '_test.go');
        testFileContent = `package main\n\nimport "testing"`;
    } else {
        vscode.window.showErrorMessage(`Unsupported file type: ${extension}`);
        return;
    }

    const testFilePath = path.join(testDir, testFileName);
    // console.log(testFilePath, testDir, "testFilePath");

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    if (!fs.existsSync(testFilePath)) {
        fs.writeFileSync(testFilePath, testFileContent);
        vscode.window.showInformationMessage(`Created test file: ${testFilePath}`);
    } else {
        vscode.window.showInformationMessage(`Test file already exists: ${testFilePath}`);
    }
}

export default Utg;
