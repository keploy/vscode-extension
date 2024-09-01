import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

async function Utg(context: vscode.ExtensionContext) {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                const terminal = vscode.window.createTerminal("Keploy Terminal");
                terminal.show();

                const editor = vscode.window.activeTextEditor;
                let currentFilePath = "";
                if (editor) {
                    const document = editor.document;
                    currentFilePath = document.uri.fsPath;
                    vscode.window.showInformationMessage(`Current opened file: ${currentFilePath}`);
                } else {
                    vscode.window.showInformationMessage('No file is currently opened.');
                    return;
                }

                const scriptPath = path.join(context.extensionPath, 'scripts', 'utg.sh');

                const sourceFilePath = currentFilePath;
                ensureTestFileExists(sourceFilePath);

                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showErrorMessage('No workspace is opened.');
                    return;
                }
                const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const testDir = path.join(rootDir, 'test');
                
                let testFilePath: string;
                if (sourceFilePath.endsWith('.go')) {
                    // For Go files
                    const sourceFileName = path.basename(sourceFilePath);
                    const testFileName = sourceFileName.replace('.go', '_test.go');
                    testFilePath = path.join(path.dirname(sourceFilePath), testFileName);
                } else {
                    // For JavaScript/TypeScript files
                    testFilePath = path.join(testDir, path.basename(sourceFilePath).replace(/\.(js|ts)$/, '.test.$1'));
                }

                if (!fs.existsSync(testFilePath)) {
                    vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                    fs.writeFileSync(testFilePath, `// Test file for ${path.basename(sourceFilePath)}`);
                }

                vscode.window.showInformationMessage("testFilePath", testFilePath);
                const coverageReportPath = "./coverage/cobertura-coverage.xml";

                // Adjust the command based on the file type
                let command: string;
                if (sourceFilePath.endsWith('.go')) {
                    command = `go test -v -coverprofile=coverage.out ${sourceFilePath}; go tool cover -html=coverage.out -o ${coverageReportPath}`;
                } else {
                    command = `sh "${scriptPath}" "${sourceFilePath}" "${testFilePath}" "${coverageReportPath}";`;
                }

                terminal.sendText(command);

                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose();
                        resolve();
                    }
                });

            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage('Error occurred Keploy utg: ' + error);
                reject(error);
            }
        });
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Error occurred Keploy utg: ' + error);
        throw error;
    }
}

async function ensureTestFileExists(sourceFilePath: string): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('No workspace is opened.');
        return;
    }
    const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;

    let testFilePath: string;
    if (sourceFilePath.endsWith('.go')) {
        // For Go files, create the test file in the same directory
        const sourceFileName = path.basename(sourceFilePath);
        const testFileName = sourceFileName.replace('.go', '_test.go');
        testFilePath = path.join(path.dirname(sourceFilePath), testFileName);
    } else {
        // For JavaScript/TypeScript files
        const testDir = path.join(rootDir, 'test');
        const relativeSourceFilePath = path.relative(rootDir, sourceFilePath);
        const sourceFileName = path.basename(sourceFilePath);
        const testFileName = sourceFileName.replace(/\.(js|ts)$/, '.test.$1');
        testFilePath = path.join(testDir, relativeSourceFilePath.replace(sourceFileName, testFileName));
    }

    const testFileDir = path.dirname(testFilePath);
    if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir, { recursive: true });
    }

    if (!fs.existsSync(testFilePath)) {
        fs.writeFileSync(testFilePath, `// Test file for ${path.basename(sourceFilePath)}`);
        vscode.window.showInformationMessage(`Created test file: ${testFilePath}`);
    } else {
        vscode.window.showInformationMessage(`Test file already exists: ${testFilePath}`);
    }
}

export default Utg;