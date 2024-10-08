import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';


async function Utg(context: vscode.ExtensionContext , additional_prompts?:string,testFilesPath?: vscode.Uri[] | undefined) {
    
    try {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const token = await context.globalState.get<'string'>('JwtToken');
                let apiResponse: string = '';
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
    
                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showErrorMessage('No workspace is opened.');
                    return;
                }
    
                const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const extension = path.extname(sourceFilePath);
                let testFilePaths: string[] = [];
                let command: string;
                let coverageReportPath: string;
                let testFileContent: string;
    
                if (extension === '.js' || extension === '.ts') {
                    if (testFilesPath && testFilesPath.length > 0) {
                        // Use only the first path from testFilesPath
                        testFilePaths = [testFilesPath[0].fsPath];
                    } else {
                        const testDir = path.join(rootDir, 'test');
                
                        // Check if the test directory exists, if not, create it
                        if (!fs.existsSync(testDir)) {
                            fs.mkdirSync(testDir, { recursive: true });
                        }
                      
                        const defaultTestFilePath = path.join(
                            rootDir, 
                            'test', 
                            path.basename(sourceFilePath).replace(extension, `.test${extension}`)
                        );
                        testFilePaths.push(defaultTestFilePath);
                        if (!fs.existsSync(defaultTestFilePath)) {
                            vscode.window.showInformationMessage("Test doesn't exist", defaultTestFilePath);
                            fs.writeFileSync(
                                defaultTestFilePath, 
                                `describe('Dummy test', () => {\n` +
                                `    it('dummy test', async () => {\n` +
                                `        expect(true);\n` +
                                `    });\n` +
                                `});\n`
                            );
                        }
                    }
                    command = `npm test -- --coverage --coverageReporters=text --coverageReporters=cobertura --coverageDirectory=./coverage`;
                    coverageReportPath = "./coverage/cobertura-coverage.xml";
    
                } else if (extension === '.py') {
                    if (testFilesPath && testFilesPath.length > 0) {
                        // Use only the first path from testFilesPath
                        testFilePaths = [testFilesPath[0].fsPath];
                    } else {
                        const testDir = path.join(rootDir, 'test');
                
                        // Check if the test directory exists, if not, create it
                        if (!fs.existsSync(testDir)) {
                            fs.mkdirSync(testDir, { recursive: true });
                        }
                        
                        const defaultTestFilePath = path.join(testDir, 'test_' + path.basename(sourceFilePath));
                        testFilePaths.push(defaultTestFilePath);
                        
                        if (!fs.existsSync(defaultTestFilePath)) {
                            vscode.window.showInformationMessage("Test doesn't exist", defaultTestFilePath);
                            
                            const testContent = `import sys\n` +
                                `import os\n\n` +
                                `sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))\n\n` +
                                `def test_dummy():\n` +
                                `    assert True\n`;
                            
                            fs.writeFileSync(defaultTestFilePath, testContent);
                        }
                    }
                    command = `pytest --cov=${path.basename(sourceFilePath, '.py')} --cov-report=xml:coverage.xml ${testFilePaths[0]}`;
                    coverageReportPath = "./coverage.xml";
    
                } else if (extension === '.java') {
                      // **Java (.java) File Handling with Package Name Extraction**

    // Define the root test directory for Java tests
                const testDir = path.join(rootDir, 'src', 'test', 'java');

                // Read the source Java file to extract the package name
                let packageName = 'default'; // Default package name if not found
                try {
                 const javaFileContent = fs.readFileSync(sourceFilePath, 'utf-8');
                const packageLine = javaFileContent.split('\n').find(line => line.trim().startsWith('package '));
                if (packageLine) {
                    const parts = packageLine.trim().split(' ');
                    if (parts.length >= 2) {
                        packageName = parts[1].replace(';', '').trim(); // Remove trailing semicolon if present
                        console.log(`🐰 Extracted package name: ${packageName}`);
                    } else {
                        console.log('❌ Unable to parse package name. Using default "default".');
                    }
                } else {
                    console.log('❌ No package declaration found. Using default "default".');
                }
            } catch (readError) {
                console.log('❌ Error reading Java source file:', readError);
            }

            // Convert package name to directory path (e.g., com.example -> com/example)
            const packagePath = packageName.split('.').join(path.sep);
            const fullTestDir = path.join(testDir, packagePath);

            // Ensure the test directory exists
            if (!fs.existsSync(fullTestDir)) {
                fs.mkdirSync(fullTestDir, { recursive: true });
                console.log(`🐰 Created test directory: ${fullTestDir}`);
            }

            // Define the test file name by appending 'Test' to the original class name
            const originalClassName = path.basename(sourceFilePath, '.java');
            const testFileName = `${originalClassName}Test.java`;
            const testFilePath = path.join(fullTestDir, testFileName);

            testFilePaths.push(testFilePath);

            if (!fs.existsSync(testFilePath)) {
                vscode.window.showInformationMessage("Test doesn't exist", testFilePath);

                // **Create Test File Content with Proper Package and JUnit Imports**
                const testFileContent = `package ${packageName};`;
                fs.writeFileSync(testFilePath, testFileContent);
                vscode.window.showInformationMessage(`Created test file: ${testFilePath}`);
                console.log(`🐰 Created test file with package name: ${testFilePath}`);
            } else {
                console.log(`✅ Test file already exists: ${testFilePath}`);
            }

            // **Set Command and Coverage Report Path for Java**
            command = `mvn clean test jacoco:report`;
            coverageReportPath = "./target/site/jacoco/jacoco.xml";
    
                } else if (extension === '.go') {
                    // Proceed as before for Go
                    //todo: have to detect the package name and instead of package main that should go there.
                   // **Go (.go) File Handling with Package Name Extraction**
                    
                   const TestFilePath = path.dirname(currentFilePath);
                   console.log("TestFilePath is : ", TestFilePath);
                   const defaultTestFilePath = path.join( TestFilePath,path.basename(sourceFilePath).replace('.go', '_test.go'));
                   testFilePaths.push(defaultTestFilePath);

                   if (!fs.existsSync(defaultTestFilePath)) {
                    //    vscode.window.showInformationMessage("Test doesn't exist", defaultTestFilePath);
                       
                       // **Extract Package Name from Source File**
                       let packageName = 'main'; // Default package name if not found
                       try {
                           const goFileContent = fs.readFileSync(sourceFilePath, 'utf-8');
                           const packageLine = goFileContent.split('\n').find(line => line.trim().startsWith('package '));
                           if (packageLine) {
                               const parts = packageLine.trim().split(' ');
                               if (parts.length >= 2) {
                                   packageName = parts[1].trim();
                                   console.log(`🐰 Extracted package name: ${packageName}`);
                               } else {
                                   console.log('❌ Unable to parse package name. Using default "main".');
                               }
                           } else {
                               console.log('❌ No package declaration found. Using default "main".');
                           }
                       } catch (readError) {
                           console.log('❌ Error reading Go source file:', readError);
                       }

                       // **Create Test File Content with Extracted Package Name**
                       testFileContent = `package ${packageName}`;
                       fs.writeFileSync(defaultTestFilePath, testFileContent);
                       vscode.window.showInformationMessage(`Created test file with package name: ${defaultTestFilePath}`);
                   }

                   // **Set Command and Coverage Report Path for Go**
                   command = `go test -v ./... -coverprofile=coverage.out && gocov convert coverage.out | gocov-xml > coverage.xml`;
                   coverageReportPath = "./coverage.xml";
                } else {
                    vscode.window.showErrorMessage(`Unsupported file type: ${extension}`);
                    return;
                }

                console.log("additional_prompts" , additional_prompts);
                if(!additional_prompts){
                    additional_prompts = "";
                }
    
                // Adjust the terminal command to include the test file path
                terminal.sendText(`sh "${scriptPath}" "${sourceFilePath}" "${testFilePaths[0]}" "${coverageReportPath}" "${command}" "${additional_prompts}";`);
    
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
                // Add a 5-second delay before calling the API
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
                        console.log("token not found");
                    }
                } catch (apiError) {
                    vscode.window.showErrorMessage('Error during API request: ' + apiError);
                }
    
                const disposable = vscode.window.onDidCloseTerminal(eventTerminal => {
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


// Separate function for making the API request using axios
export async function makeApiRequest(token:string): Promise<string | null> {
    const url = 'https://api.keploy.io/ai/call/count ';

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
            console.log(`API call failed: ${error.message}`);
        } else {
            // Handle oth   er errors (in case they are not Axios errors)
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
