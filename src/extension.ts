import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import SignIn, { validateFirst,SignInWithOthers, ValidateSignInWithOthers } from './SignIn';
import oneClickInstall from './OneClickInstall';
import { getKeployVersion, getCurrentKeployVersion } from './version';
import { downloadAndUpdate, downloadAndUpdateDocker } from './updateKeploy';
import Utg, { makeApiRequest } from './Utg';
import { getGitHubAccessToken, getMicrosoftAccessToken, getInstallationID } from './SignIn';
import TreeSitter from 'tree-sitter';
import TreeSitterJavaScript from 'tree-sitter-javascript';
import TreeSitterPython from 'tree-sitter-python';
import TreeSitterJava from 'tree-sitter-java';
import TreeSitterGo from 'tree-sitter-go';

class KeployCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;
    private treeCache: { [filePath: string]: TreeSitter.Tree } = {};
    private invalidateCache(fileName: string) {
        delete this.treeCache[fileName];  // Remove the cached tree
    }
    constructor() {
        // Listen for document changes and invalidates cache
        vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this));

        // Listen for document save events and invalidates cache
        vscode.workspace.onDidSaveTextDocument(this.onDocumentSave.bind(this));
    }

 // Triggered when the document is saved
    private onDocumentSave(document: vscode.TextDocument) {
        console.log('Document saved:', document.uri.fsPath);
        const fileName = document.uri.fsPath;
        this.invalidateCache(fileName);  // Invalidate the cache on save
    }

    private onDocumentChange(event: vscode.TextDocumentChangeEvent) {
        console.log('Document changed:', event.document.uri.fsPath);
        const fileName = event.document.uri.fsPath;
        this.invalidateCache(fileName);  // Invalidate the cache on change
    }

    private getTreeFromCache(fileName: string, text: string): TreeSitter.Tree {
        if (this.treeCache[fileName]) {
            console.log(`Cache hit for: ${fileName}`);
            this.logCacheSize();  // Log the cache size
            return this.treeCache[fileName];  // Return cached tree if available
        }
        const parser = new TreeSitter();

        // Set the language based on file extension
        if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
            parser.setLanguage(TreeSitterJavaScript);
        } else if (fileName.endsWith('.py')) {
            parser.setLanguage(TreeSitterPython);
        } else if (fileName.endsWith('.java')) {
            parser.setLanguage(TreeSitterJava);
        } else if (fileName.endsWith('.go')) {
            parser.setLanguage(TreeSitterGo);
        } else {
            throw new Error("Unsupported file type");
        }

        const tree = parser.parse(text);  // Parse the document text
        this.treeCache[fileName] = tree;  // Cache the parsed tree
        console.log(`Cache miss for: ${fileName}`);
        this.logCacheSize();  // Log the cache size after adding a new entry
    
        return tree;
    }

    private logCacheSize() {
        let totalSize = 0;
    
        // Iterate over each key-value pair in the cache
        for (const [key, value] of Object.entries(this.treeCache)) {
            // Add the size of the key (file name)
            totalSize += this.getSizeInBytes(key);
            
            // Add the estimated size of the parsed tree (value)
            totalSize += this.getSizeInBytes(value);
        }
    
        // Convert total size from bytes to kilobytes
        const totalSizeKB = totalSize / 1024;
        
        console.log(`Current cache size: ${totalSize} bytes (${totalSizeKB.toFixed(2)} KB)`);
    }

    private getSizeInBytes(obj: any): number {
        if (typeof obj === 'string') {
            // If the object is a string, calculate the size based on UTF-16 encoding (2 bytes per character)
            return obj.length * 2;
        } else if (typeof obj === 'object') {
            // If the object is an object, recursively calculate the size of its properties
            let objectSize = 0;
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    objectSize += this.getSizeInBytes(key);  // Size of key
                    objectSize += this.getSizeInBytes(obj[key]);  // Size of value
                }
            }
            return objectSize;
        }
        return 0;  // For other types like numbers, you can return a fixed size if needed
    }

    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const fileName = document.uri.fsPath;
        if (
            fileName.endsWith('.test.js') || 
            fileName.endsWith('.test.ts') || 
            fileName.endsWith('Test.java') ||  // Check for Java test file ending
            fileName.includes('/Test')   ||      // Check for Java test file prefix in the path
            fileName.includes('/test/') ||    // Skip files in a "tests" directory
            fileName.endsWith('_test.go') ||
            fileName.includes('test_')
        ) {
            return [];
        }

        const text = document.getText();
        const codeLenses: vscode.CodeLens[] = [];

        try {
            const tree = this.getTreeFromCache(fileName, text);
            const cursor = tree.walk();

            const traverseTree = (cursor: TreeSitter.TreeCursor, ancestors: TreeSitter.SyntaxNode[] = []) => {
                const node = cursor.currentNode;

                if (
                    (fileName.endsWith('.js') || fileName.endsWith('.ts')) &&
                    (node.type === 'function_declaration' || node.type === 'function_expression')
                ) {
                    const line = document.positionAt(node.startIndex).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.utg',
                        arguments: [document.uri.fsPath]
                    }));
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Additional Prompts',
                        command: 'keploy.showSidebar',
                        arguments: [document.uri.fsPath]
                    }));
                    console.log('🐰 Found arrow function:', node.firstChild?.text);
                    const functionName = node.firstChild?.text || '';  // Default to an empty string if undefined
                    this.findTestCasesForFunction(functionName, document, codeLenses);
                } else if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
                    if (node.type === 'arrow_function') {
                        const parent = ancestors[ancestors.length - 1];
                        if (parent?.type !== 'CallExpression') {
                            const line = document.positionAt(node.startIndex).line;
                            const range = new vscode.Range(line, 0, line, 0);
                            codeLenses.push(new vscode.CodeLens(range, {
                                title: '🐰 Generate unit tests',
                                command: 'keploy.utg',
                                arguments: [document.uri.fsPath]
                            }));

                            codeLenses.push(new vscode.CodeLens(range, {
                                title: '🐰 Additional Prompts',
                                command: 'keploy.showSidebar',
                                arguments: [document.uri.fsPath]
                            }));
                            console.log('🐰 Found arrow function:', node.firstChild?.text);
                            const functionName = node.firstChild?.text || '';  // Default to an empty string if undefined
                            this.findTestCasesForFunction(functionName, document, codeLenses);
                        }
                    }
                } else if (fileName.endsWith('.py') && node.type === 'function_definition') {
                    const line = document.positionAt(node.startIndex).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.utg',
                        arguments: [document.uri.fsPath]
                    }));
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Additional Prompts',
                        command: 'keploy.showSidebar',
                        arguments: [document.uri.fsPath]
                    }));
                } else if (fileName.endsWith('.java') && (node.type === 'method_declaration' || node.type === 'constructor_declaration')) {
                    const line = document.positionAt(node.startIndex).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.utg',
                        arguments: [document.uri.fsPath]
                    }));
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Additional Prompts',
                        command: 'keploy.showSidebar',
                        arguments: [document.uri.fsPath]
                    }));
                } else if (fileName.endsWith('.go') && (node.type === 'function_declaration' || node.type === 'method_declaration')) {
                    const line = document.positionAt(node.startIndex).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.utg',
                        arguments: [document.uri.fsPath]
                    }));
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Additional Prompts',
                        command: 'keploy.showSidebar',
                        arguments: [document.uri.fsPath]
                    }));
                }

                // Traverse to the first child node
                if (cursor.gotoFirstChild()) {
                    traverseTree(cursor, ancestors.concat(node));
                    cursor.gotoParent(); // Go back to parent after finishing with the child
                }
                // Traverse to the next sibling node
                if (cursor.gotoNextSibling()) {
                    traverseTree(cursor, ancestors);
                }
            };

            traverseTree(cursor);

        } catch (error) {
            console.error(error);
        }

        return codeLenses;
    }

    private findTestCasesForFunction(functionName: string, document: vscode.TextDocument, codeLenses: vscode.CodeLens[]) {
        console.log(`🐰 Searching for test cases for function: ${functionName}`);
        // Look for related test files (.test.js or .spec.js for JS/TS)
        const excludePattern = '**/node_modules/**';  // Exclude node_modules from the search
        const maxResults = 100;  // Limit the number of files returned
        console.log('🐰 Searching for test files...');
        const testFiles = vscode.workspace.findFiles('**/*.{test,spec}.{js,ts}', excludePattern, maxResults);
    
        testFiles.then((files) => {
            console.log('🐰 Found test files:', files);
            files.forEach(async (fileUri) => {
                console.log('🐰 Opening test file:', fileUri.fsPath);
                const fileDocument = await vscode.workspace.openTextDocument(fileUri);
                console.log('🐰 Reading test file:', fileUri.fsPath);
                const text = fileDocument.getText();
    
                try {
                    const tree = this.getTreeFromCache(fileUri.fsPath, text);
                    const cursor = tree.walk();
                    let found = false;

                    console.log('🐰 Walking test file:', fileUri.fsPath);
                    // Traverse the test file to find related test functions
                    const traverseTestTree = (cursor: TreeSitter.TreeCursor, ancestors: TreeSitter.SyntaxNode[] = []) => {
                        const node = cursor.currentNode;
    
                        // Check for require statement: const <functionName> = require('<path>')
                        if (node.type === 'call_expression') {
                            const callNode = node.firstChild;
                            if (callNode?.text === 'require') {
                                const requiredModule = node.lastChild?.text;
                                if (requiredModule && requiredModule.includes(functionName)) {
                                    found = true;
                                    console.log(`🐰 Found function ${functionName} used in require statement in file: ${fileUri.fsPath}`);
                                }
                            }
                        }
    
                        // Check for ES6 import statements: import <functionName> from '<path>'
                        if (node.type === 'import_statement') {
                            const importNode = node.childForFieldName('source');
                            if (importNode && importNode.text.includes(functionName)) {
                                found = true;
                                console.log(`🐰 Found function ${functionName} used in import statement in file: ${fileUri.fsPath}`);
                            }
                        }
    
                        if (found) {
                            return; // Stop traversal once we find the function usage
                        }
    
                        if (cursor.gotoFirstChild()) {
                            traverseTestTree(cursor, ancestors.concat(node));
                            cursor.gotoParent();
                        }
                        if (cursor.gotoNextSibling()) {
                            traverseTestTree(cursor, ancestors);
                        }
                    };
    
    
                    traverseTestTree(cursor);
                    if (!found) {
                        const searchFunctionUsageInTests = (cursor: TreeSitter.TreeCursor) => {
                            const node = cursor.currentNode;
                            if (node.type === 'call_expression' && node.text.includes(functionName)) {
                                console.log(`🐰 Function ${functionName} used in test case in file: ${fileUri.fsPath}`);
                                found = true;
                            }
                            if (cursor.gotoFirstChild()) {
                                searchFunctionUsageInTests(cursor);
                                cursor.gotoParent();
                            }
                            if (cursor.gotoNextSibling()) {
                                searchFunctionUsageInTests(cursor);
                            }
                        };
                        searchFunctionUsageInTests(cursor);
                    }
    
                    if (!found) {
                        console.log(`❌ No usage of function ${functionName} found in file: ${fileUri.fsPath}`);
                    }
    
                } catch (error) {
                    console.error(error);
                }
            });
        });
    }
    

}


export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri , context);
    context.subscriptions.push(
        vscode.window.registerUriHandler({
            async handleUri(uri) {
                // Extract the token and state from the URI query parameters
                const token = uri.query.split('token=')[1]?.split('&')[0];
                const state = uri.query.split('state=')[1];
        
                if (token) {
                    vscode.window.showInformationMessage(`You are now logged in!`);
        
                    await context.globalState.update('JwtToken', token);
                    await context.globalState.update('SignedOthers', true);
        
                    const response = await ValidateSignInWithOthers(token);
        
                    if (response) {
                        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
                        vscode.commands.executeCommand('setContext', 'keploy.signedOut', false);
                    } else {
                        vscode.window.showInformationMessage('Token validation failed!');
                    }
                } else {
                    vscode.window.showInformationMessage('Login failed');
                }
            }
        }),
        
        vscode.window.registerWebviewViewProvider(
            "Keploy-Sidebar",
            sidebarProvider
        ),
        vscode.languages.registerCodeLensProvider(
            { language: 'javascript', scheme: 'file' },
            new KeployCodeLensProvider()
        ),
        vscode.languages.registerCodeLensProvider(
            { language: 'typescript', scheme: 'file' },
            new KeployCodeLensProvider()
        ),
        vscode.languages.registerCodeLensProvider(
            { language: 'python', scheme: 'file' },
            new KeployCodeLensProvider()
        ),
        vscode.languages.registerCodeLensProvider(
            { language: 'go', scheme: 'file' },
            new KeployCodeLensProvider()
        ),
        vscode.languages.registerCodeLensProvider(
            { language: 'java', scheme: 'file' },
            new KeployCodeLensProvider()
        ),

    );


    oneClickInstall();

    // let signedIn = context.globalState.get('ourToken');
    context.globalState.update('SignedOthers' , undefined);
    context.globalState.update('SubscriptionEnded' , undefined);
    console.log(context.globalState);
    // if (signedIn) {
    //     vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
    //     sidebarProvider.postMessage('navigateToHome', 'KeployHome');
    // }

    let accessToken = context.globalState.get<string>('JwtToken');

    // Check if the access token is already present in the global state
    // const accessToken = context.globalState.get<string>('accessToken');
    // disable if access token is already present
    if (accessToken) {
        console.log("accessToken is verfied user us logged in");
        // Disable the sign-in command since the user is already signed in

        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
        vscode.window.showInformationMessage('You are already signed in!');
        // enable the signout command
        vscode.commands.executeCommand('setContext', 'keploy.signedOut', false);
        context.globalState.update('SignedOthers' , true);


    } else {
        vscode.commands.executeCommand('setContext', 'keploy.signedOut', true);
        // Register the sign-in command if not signed in
        let signInCommand = vscode.commands.registerCommand('keploy.SignInWithGithub', async () => {
            try {
                const result = await getGitHubAccessToken();

                if (result) {
                    const { accessToken, email } = result;

                    getInstallationID();

                    // Store the access token in global state
                    await context.globalState.update('accessToken', accessToken);

                    const { emailID, isValid, error , JwtToken } = await validateFirst(accessToken, "https://api.keploy.io");

                    console.log({emailID , isValid , error , JwtToken});

                    await context.globalState.update('JwtToken', JwtToken);

                    // if (isValid) {
                    vscode.window.showInformationMessage('You are now signed in!');
                    vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
                    vscode.commands.executeCommand('setContext', 'keploy.signedOut', false);
                    // } else {
                    //     console.log('Validation failed for the user !');
                    // }

                } else {
                    console.log('Failed to get the session or email.');
                    vscode.window.showInformationMessage('Failed to sign in Keploy!');
                }
            } catch (error) {
                // console.error('Error during sign-in:', error);
                vscode.window.showInformationMessage('Failed to sign in Keploy!');
            }
        });

        
    }
    let signInWithOthersCommand = vscode.commands.registerCommand('keploy.SignInWithOthers', async () => {
        try {
            await SignInWithOthers(); // The result will now be handled in the URI handler
        } catch (error) {
            // console.error('Error during sign-in:', error);
            vscode.window.showInformationMessage('Failed to sign in Keploy!');
        }
    });


    // context.subscriptions.push(signInCommand);
    context.subscriptions.push(signInWithOthersCommand);

    //defining another function for microsoft to redirect because  functions with same command name cannot be added in package.json
    
    let signInWithMicrosoft = vscode.commands.registerCommand('keploy.SignInWithMicrosoft', async () => {
        try {
            await SignInWithOthers(); // The result will now be handled in the URI handler
        } catch (error) {
            // console.error('Error during sign-in:', error);
            vscode.window.showInformationMessage('Failed to sign in Keploy!');
        }
    });

    context.subscriptions.push(signInWithMicrosoft);



    let signout = vscode.commands.registerCommand('keploy.SignOut', async () => {
        console.log("logging out");
        await context.globalState.update('accessToken', undefined);
        await context.globalState.update('JwtToken', undefined);
        await context.globalState.update('SignedOthers', undefined);
        vscode.window.showInformationMessage('You have been signed out.');
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', false);
        vscode.commands.executeCommand('setContext', 'keploy.signedOut', true);
    });

    context.subscriptions.push(signout);

    let viewKeployVersionDisposable = vscode.commands.registerCommand('keploy.KeployVersion', async () => {
        const currentVersion = await getCurrentKeployVersion();
        vscode.window.showInformationMessage(`The current version of Keploy is ${currentVersion}`);
    }
    );
    context.subscriptions.push(viewKeployVersionDisposable);

    let viewChangeLogDisposable = vscode.commands.registerCommand('keploy.viewChangeLog', () => {
        const changeLogUrl = 'https://marketplace.visualstudio.com/items?itemName=Keploy.keployio';
        vscode.env.openExternal(vscode.Uri.parse(changeLogUrl));
    }
    );
    context.subscriptions.push(viewChangeLogDisposable);

    let viewDocumentationDisposable = vscode.commands.registerCommand('keploy.viewDocumentation', () => {
        const docsUrl = 'https://keploy.io/docs/';
        vscode.env.openExternal(vscode.Uri.parse(docsUrl));
    }
    );
    context.subscriptions.push(viewDocumentationDisposable);


    let getLatestVersion = vscode.commands.registerCommand('keploy.getLatestVersion', async () => {
        const latestVersion = await getKeployVersion();
        vscode.window.showInformationMessage(`The latest version of Keploy is ${latestVersion}`);
    }
    );
    context.subscriptions.push(getLatestVersion);

    let updateKeployDisposable = vscode.commands.registerCommand('keploy.updateKeploy', () => {
        //open popup to ask user to choose beteween keploy docker or keploy binary
        const options = [
            { label: "Keploy Docker", description: "Update using Keploy Docker" },
            { label: "Keploy Binary", description: "Update using Keploy Binary" }
        ];

        vscode.window.showQuickPick(options, {
            placeHolder: "Choose how to update Keploy"
        }).then(async selection => {
            if (selection) {
                // Handle the user's choice here
                if (selection.label === "Keploy Docker") {
                    try {
                        await downloadAndUpdateDocker();
                        vscode.window.showInformationMessage('Keploy Docker updated!');
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to update Keploy Docker: ${error}`);
                    }
                } else if (selection.label === "Keploy Binary") {
                    try {
                        await downloadAndUpdate();
                        // this._view?.webview.postMessage({ type: 'success', value: 'Keploy binary updated!' });
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to update Keploy binary: ${error}`);
                    }
                }
            }
        });

    });

    
    context.subscriptions.push(updateKeployDisposable);

    let showSidebarDisposable = vscode.commands.registerCommand('keploy.showSidebar', async () => {
        // Show the sidebar when this command is executed
        vscode.commands.executeCommand('workbench.view.extension.Keploy-Sidebar');
        sidebarProvider.postMessage("KeployChatBot")
        vscode.window.showInformationMessage('Sidebar opened for additional prompts.');
    });
    
    context.subscriptions.push(showSidebarDisposable);
    

    // Register the command
    let disposable = vscode.commands.registerCommand('keploy.utg', async (uri: vscode.Uri , additional_prompts?:string) => {
        // Check if the user is already signed in
        const signedIn = await context.globalState.get('accessToken');
        const signedInOthers = await context.globalState.get('SignedOthers');
        const SubscriptionEnded = await context.globalState.get('SubscriptionEnded') !== undefined ? context.globalState.get('SubscriptionEnded') : true;
        const token  = await context.globalState.get<'string'>('JwtToken');
        console.log("SubscriptionEnded Value: ", SubscriptionEnded);
        
        if (!signedIn && !signedInOthers) {
            // Redirect to the website if signed in
            await vscode.commands.executeCommand('keploy.SignInWithOthers');
            return; 
        } else {
            if (SubscriptionEnded === true) {
                try {
                    // Call the API inside the try block
                    if(token){
                        const apiResponse = await makeApiRequest(token) || 'no response';
                            const response = JSON.parse(apiResponse);
                            await context.globalState.update('apiResponse', apiResponse);
                            console.log(response);
                            if(response.usedCall < response.totalCall ){
                                await context.globalState.update('SubscriptionEnded' , false);
                            }else{
                                const redirectUrl = 'https://app.keploy.io/signin?take_to_pricing=true';
                                vscode.env.openExternal(vscode.Uri.parse(redirectUrl));                    
                            }
        
                        // console.log('Subscription renewal response:', response.data);
                    }else{
                        console.log("Token not defined in the Extension.ts");
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to renew subscription.');
                    console.error('Subscription renewal error:', error);
                }
            } 
            const updatedSubscriptionEnded = await context.globalState.get('SubscriptionEnded');

            if (updatedSubscriptionEnded === false) {
                // If SubscriptionEnded is false or undefined, continue running Utg
                vscode.window.showInformationMessage('Welcome to Keploy!');
                await Utg(context , additional_prompts);
            }
        }
    });
    

    context.subscriptions.push(disposable);
}



export function deactivate() { }