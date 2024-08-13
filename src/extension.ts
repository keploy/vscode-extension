import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import SignIn from './SignIn';
import oneClickInstall from './OneClickInstall';
import Utg from './Utg';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

class KeployCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;

    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const fileName = document.uri.fsPath;
        if (fileName.endsWith('.test.js') || fileName.endsWith('.test.ts')) {
            return [];
        }

        const text = document.getText();
        const codeLenses: vscode.CodeLens[] = [];

        try {
            const ast = acorn.parse(text, { ecmaVersion: 2020, sourceType: 'module' });

            walk.fullAncestor(ast, (node: any, state: any, ancestors: any[]) => {
                if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                    const line = document.positionAt(node.start).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.doSomething',
                        arguments: [document.uri.fsPath]
                    }));
                } else if (node.type === 'ArrowFunctionExpression') {
                    const parent = ancestors[ancestors.length - 2];
                    if (parent.type !== 'CallExpression' || (parent.callee.property?.name !== 'then' && parent.callee.property?.name !== 'catch')) {
                        const line = document.positionAt(node.start).line;
                        const range = new vscode.Range(line, 0, line, 0);
                        codeLenses.push(new vscode.CodeLens(range, {
                            title: '🐰 Generate unit tests',
                            command: 'keploy.doSomething',
                            arguments: [document.uri.fsPath]
                        }));
                    }
                }
            });

        } catch (error) {
            console.error(error);
        }

        return codeLenses;
    }
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
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
        )
    );

    // Register the command
    let disposable = vscode.commands.registerCommand('keploy.doSomething', async (uri: vscode.Uri) => {

        // Display a message box to the user
        vscode.window.showInformationMessage('Welcome to Keploy!');

        await Utg(context);
    });

    context.subscriptions.push(disposable);
    oneClickInstall();

    let signedIn = context.globalState.get('ourToken');
    console.log(context.globalState);
    if (signedIn) {
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
        sidebarProvider.postMessage('navigateToHome', 'KeployHome');
    }
    let signInCommand = vscode.commands.registerCommand('keploy.SignIn', async () => {

        const response: any = await SignIn();
        context.globalState.update('accessToken', response.accessToken);
        vscode.window.showInformationMessage('You are now signed in!');
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
    });
    context.subscriptions.push(signInCommand);

    let getLatestKeployDisposable = vscode.commands.registerCommand('keploy.KeployVersion', () => {
        // Logic to get the latest Keploy
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(getLatestKeployDisposable);

    let viewChangeLogDisposable = vscode.commands.registerCommand('keploy.viewChangeLog', () => {
        // Logic to view the change log
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(viewChangeLogDisposable);

    let viewDocumentationDisposable = vscode.commands.registerCommand('keploy.viewDocumentation', () => {
        // Logic to view the documentation
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(viewDocumentationDisposable);

    let getLatestVersion = vscode.commands.registerCommand('keploy.getLatestVersion', () => {
        // Logic to get the latest version
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(getLatestVersion);

    let updateKeploy = vscode.commands.registerCommand('keploy.updateKeploy', () => {
        // Logic to get the latest version
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(updateKeploy);

    // Listen to terminal close event
    vscode.window.onDidCloseTerminal((terminal) => {
        if (terminal.name === "Keploy Terminal") {
            vscode.window.showInformationMessage('Keploy Terminal closed.');
            // Perform any additional cleanup if necessary
        }
    });
}

export function deactivate() { }
