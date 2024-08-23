import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


async function Utg(context: vscode.ExtensionContext) {
    try {
        return new Promise<void>((resolve, reject) => {
            try {
                // Create a terminal named "Keploy Terminal"
                const terminal = vscode.window.createTerminal("Keploy Terminal");

                terminal.show();
                // Your command logic here
                const editor = vscode.window.activeTextEditor;
                let currentFilePath = "";
                if (editor) {
                    const document = editor.document;
                    currentFilePath = document.uri.fsPath;
                    vscode.window.showInformationMessage(`Current opened file: ${currentFilePath}`);
                    // Add your additional logic here
                } else {
                    vscode.window.showInformationMessage('No file is currently opened.');
                }
                const scriptPath = path.join(context.extensionPath, 'scripts', 'utg.sh');


                const sourceFilePath = currentFilePath;
                ensureTestFileExists(sourceFilePath);


                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showErrorMessage('No workspace is opened.');
                    return;
                }
                const rootDir = path.dirname(vscode.workspace.workspaceFolders[0].uri.fsPath); // Root directory of the project

                const testDir = path.join(rootDir, 'test');
                const testFilePath = path.join(testDir, path.basename(sourceFilePath).replace('.js', '.test.js'));
                if (!fs.existsSync(testFilePath)) {
                    vscode.window.showInformationMessage("Test doesn't exists", testFilePath);
                    fs.writeFileSync(testFilePath, `// Test file for ${testFilePath}`);
                }

                vscode.window.showInformationMessage("testFilePath", testFilePath);
                const coverageReportPath = "./coverage/cobertura-coverage.xml";
                terminal.sendText(`sh "${scriptPath}" "${sourceFilePath}" "${testFilePath}" "${coverageReportPath}";`);

                // Listen for terminal close event
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    console.log('Terminal closed');
                    if (eventTerminal === terminal) {
                        disposable.dispose(); // Dispose the listener
                        resolve(); // Resolve the promise
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
    const rootDir = path.dirname(vscode.workspace.workspaceFolders[0].uri.fsPath); // Root directory of the project

    const testDir = path.join(rootDir, 'test');
    const relativeSourceFilePath = path.relative(rootDir, sourceFilePath);
    const sourceFileName = path.basename(sourceFilePath);
    const testFileName = sourceFileName.replace('.js', '.test.js');
    const testFilePath = path.join(testDir, relativeSourceFilePath.replace(sourceFileName, testFileName));

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    const testFileDir = path.dirname(testFilePath);
    if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir, { recursive: true });
    }

    if (!fs.existsSync(testFilePath)) {
        fs.writeFileSync(testFilePath, `// Test file for ${sourceFileName}`);
        vscode.window.showInformationMessage(`Created test file: ${testFilePath}`);
    } else {
        vscode.window.showInformationMessage(`Test file already exists: ${testFilePath}`);
    }
}

export default Utg;