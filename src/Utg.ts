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
                const extension = path.extname(sourceFilePath);
                let testFilePath: string;
                let command: string;
                let coverageReportPath: string;
                if (extension === '.js' || extension === '.ts') {
                    testFilePath = path.join(path.join(rootDir, 'test'), path.basename(sourceFilePath).replace(extension, `.test${extension}`));
                    if (!fs.existsSync(testFilePath)) {
                        vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                        fs.writeFileSync(testFilePath, `// Test file for ${testFilePath}`);
                    }
                    command = `npm test -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage`;
                    coverageReportPath = "./coverage/cobertura-coverage.xml";

                } else if (extension === '.py') {
                    testFilePath = path.join(rootDir, path.basename(sourceFilePath).replace('.py', '_test.py'));
                    if (!fs.existsSync(testFilePath)) {
                        vscode.window.showInformationMessage("Test doesn't exist", testFilePath);
                        fs.writeFileSync(testFilePath, `# Test file for ${testFilePath}`);
                    }
                    command = `pytest --cov=${path.basename(sourceFilePath, '.py')} --cov-report=xml:coverage.xml ${path.basename(testFilePath)}`;
                    coverageReportPath = "./coverage.xml";

                } else {
                    vscode.window.showErrorMessage(`Unsupported file type: ${extension}`);
                    return;
                }

                terminal.sendText(`sh "${scriptPath}" "${sourceFilePath}" "${testFilePath}" "${coverageReportPath}" "${command}";`);

                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
                    if (eventTerminal === terminal) {
                        disposable.dispose();
                        resolve();
                    }
                });
            }  catch (error) {
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
    const extension = path.extname(sourceFilePath);
    const testDir = path.join(rootDir, 'test');
    const relativeSourceFilePath = path.relative(rootDir, sourceFilePath);
    const sourceFileName = path.basename(sourceFilePath)
    let testFileName: string;

    if (extension === '.js' || extension === '.ts') {
        testFileName = sourceFileName.replace(extension, `.test${extension}`);
    } else if (extension === '.py') {
        testFileName = sourceFileName.replace('.py', '_test.py');
    } else {
        vscode.window.showErrorMessage(`Unsupported file type: ${extension}`);
        return;
    }

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