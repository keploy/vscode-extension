import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import SignIn, { validateFirst,SignInWithOthers,ValidateSignInWithOthers } from './SignIn';
import oneClickInstall from './OneClickInstall';
import { getKeployVersion, getCurrentKeployVersion } from './version';
import { downloadAndUpdate, downloadAndUpdateDocker } from './updateKeploy';
import Utg, { makeApiRequest } from './Utg';
import { getGitHubAccessToken, getMicrosoftAccessToken, getInstallationID } from './SignIn';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { Sentry } from './sentryInit';
import TreeSitter from 'tree-sitter';
import TreeSitterJavaScript from 'tree-sitter-javascript';
import TreeSitterPython from 'tree-sitter-python';
import TreeSitterJava from 'tree-sitter-java';
import TreeSitterGo from 'tree-sitter-go';

class KeployCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;

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
            const parser = new TreeSitter();

            if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
                parser.setLanguage(TreeSitterJavaScript);
            } else if (fileName.endsWith('.py')) {
                parser.setLanguage(TreeSitterPython);
            } else if (fileName.endsWith('.java')) {
                parser.setLanguage(TreeSitterJava);
            } else if (fileName.endsWith('.go')) {
                parser.setLanguage(TreeSitterGo);
            } else {
                return codeLenses; // Return if file type is unsupported
            }

            const tree = parser.parse(text);
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
                } else if (fileName.endsWith('.java') && (node.type === 'method_declaration' || node.type === 'constructor_declaration')) {
                    const line = document.positionAt(node.startIndex).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.utg',
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
}

export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri , context);
    context.subscriptions.push(
        vscode.window.registerUriHandler({
            handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
              vscode.window.showInformationMessage(`URI handler called: ${uri.toString()}`);
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
        // let signInCommand = vscode.commands.registerCommand('keploy.SignIn', async () => {
        //     try {
        //         const result = await getGitHubAccessToken();

        //         if (result) {
        //             const { accessToken, email } = result;

        //             getInstallationID();

        //             // Store the access token in global state
        //             await context.globalState.update('accessToken', accessToken);

        //             const { emailID, isValid, error , JwtToken } = await validateFirst(accessToken, "https://api.keploy.io");

        //             await context.globalState.update('JwtToken', JwtToken);

        //             // if (isValid) {
        //             vscode.window.showInformationMessage('You are now signed in!');
        //             vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
        //             vscode.commands.executeCommand('setContext', 'keploy.signedOut', false);
        //             // } else {
        //             //     console.log('Validation failed for the user !');
        //             // }

        //         } else {
        //             console.log('Failed to get the session or email.');
        //             vscode.window.showInformationMessage('Failed to sign in Keploy!');
        //         }
        //     } catch (error) {
        //         // console.error('Error during sign-in:', error);
        //         vscode.window.showInformationMessage('Failed to sign in Keploy!');
        //     }
        // });
        
    }
    let signInWithOthersCommand = vscode.commands.registerCommand('keploy.SignInWithOthers', async () => {
        try {
            const result = await SignInWithOthers();
            // console.log("result from the Sign in with other , ",result);
            const accessToken = result as string; // Assert that result is a string
            // console.log('Jwt token:', accessToken);
            await context.globalState.update('JwtToken', accessToken);
            await context.globalState.update('SignedOthers', true);
            const reponse = await ValidateSignInWithOthers(accessToken);
        


        if (Boolean(accessToken)) {
            vscode.window.showInformationMessage('You are now signed in!');
            vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
            vscode.commands.executeCommand('setContext', 'keploy.signedOut', false);
        } else {
            console.log('Validation failed for the user !');
            vscode.window.showInformationMessage('Failed to sign in Keploy!');
        }
        } catch (error) {
            // console.error('Error during sign-in:', error);
            vscode.window.showInformationMessage('Failed to sign in Keploy!');
        }
    });

    // context.subscriptions.push(signInCommand);
    context.subscriptions.push(signInWithOthersCommand);

    let signout = vscode.commands.registerCommand('keploy.SignOut', async () => {
        try{
            console.log("logging out");
            await context.globalState.update('accessToken', undefined);
            await context.globalState.update('JwtToken', undefined);
            await context.globalState.update('SignedOthers', undefined);
            vscode.window.showInformationMessage('You have been signed out.');
            vscode.commands.executeCommand('setContext', 'keploy.signedIn', false);
            vscode.commands.executeCommand('setContext', 'keploy.signedOut', true);
        }catch(error){
            Sentry?.captureException(error)
        }
    });

    context.subscriptions.push(signout);

    let viewKeployVersionDisposable = vscode.commands.registerCommand('keploy.KeployVersion', async () => {
        try {
            const currentVersion = await getCurrentKeployVersion();
            vscode.window.showInformationMessage(`The current version of Keploy is ${currentVersion}`);
        } catch (error) {
            Sentry?.captureException(error);
            vscode.window.showErrorMessage('Failed to get Keploy version');
        }
    });

    context.subscriptions.push(viewKeployVersionDisposable);

    let viewChangeLogDisposable = vscode.commands.registerCommand('keploy.viewChangeLog', () => {
        try {
            const changeLogUrl = 'https://marketplace.visualstudio.com/items?itemName=Keploy.keployio';
            vscode.env.openExternal(vscode.Uri.parse(changeLogUrl));
        } catch (error) {
            Sentry?.captureException(error);
            vscode.window.showErrorMessage('Failed to open change log');
        }
    });

    context.subscriptions.push(viewChangeLogDisposable);

    let viewDocumentationDisposable = vscode.commands.registerCommand('keploy.viewDocumentation', () => {
        try {
            const docsUrl = 'https://keploy.io/docs/';
            vscode.env.openExternal(vscode.Uri.parse(docsUrl));
        } catch (error) {
            Sentry?.captureException(error);
            vscode.window.showErrorMessage('Failed to open documentation');
        }
    });

    context.subscriptions.push(viewDocumentationDisposable);

    let getLatestVersion = vscode.commands.registerCommand('keploy.getLatestVersion', async () => {
        try {
            const latestVersion = await getKeployVersion();
            vscode.window.showInformationMessage(`The latest version of Keploy is ${latestVersion}`);
        } catch (error) {
            Sentry?.captureException(error);
            vscode.window.showErrorMessage('Failed to get latest version of Keploy');
        }
    });

    context.subscriptions.push(getLatestVersion);

    let updateKeployDisposable = vscode.commands.registerCommand('keploy.updateKeploy', () => {
        try{
            //open popup to ask user to choose beteween keploy docker or keploy binary
            const options = [
                { label: "Keploy Docker", description: "Update using Keploy Docker" },
                { label: "Keploy Binary", description: "Update using Keploy Binary" }
            ];

            vscode.window.showQuickPick(options, {
                placeHolder: "Choose how to update Keploy"
            }).then(async (selection) => {
                if (selection) {
                    // Handle the user's choice here
                    if (selection.label === "Keploy Docker") {
                        try {
                            await downloadAndUpdateDocker();
                            vscode.window.showInformationMessage('Keploy Docker updated!');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to update Keploy Docker: ${error}`);
                            Sentry?.captureException(error);
                        }
                    } else if (selection.label === "Keploy Binary") {
                        try {
                            await downloadAndUpdate();
                            // this._view?.webview.postMessage({ type: 'success', value: 'Keploy binary updated!' });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to update Keploy binary: ${error}`);
                            Sentry?.captureException(error);
                        }
                    }
                }
            });
        } catch (error) {
            Sentry?.captureException(error);
            vscode.window.showErrorMessage('Failed to update Keploy');
        }
    });

    
    context.subscriptions.push(updateKeployDisposable);

    // Register the command
    let disposable = vscode.commands.registerCommand('keploy.utg', async (uri: vscode.Uri) => {
        try{
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
                    await Utg(context);
                }
            }
        }
        catch(error){
            Sentry?.captureException(error)
        }
    });
    

    context.subscriptions.push(disposable);
}



export function deactivate() { 
    Sentry?.close(2000);
}