import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import SignIn from './SignIn';
import oneClickInstall from './OneClickInstall';
import Utg from './Utg';

class KeployCodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;

    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const fileName = document.uri.fsPath;
        if (fileName.endsWith('.test.js')) {
            return [];
        }

        const topOfDocument = new vscode.Range(0, 0, 0, 0);
        return [
            new vscode.CodeLens(topOfDocument, {
                title: '⚙️ Generate keploy unit tests',
                command: 'keploy.doSomething',
                arguments: [document.uri.fsPath]
            })
        ];
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
        )
    );

    // Register the command
    let disposable = vscode.commands.registerCommand('keploy.doSomething', (uri: vscode.Uri) => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from Keploy!');

        Utg(context);
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
    }
    );
    context.subscriptions.push(signInCommand);




    let getLatestKeployDisposable = vscode.commands.registerCommand('keploy.KeployVersion', () => {
        // Logic to get the latest Keploy
        vscode.window.showInformationMessage('Feature coming soon!');
    }
    );
    context.subscriptions.push(getLatestKeployDisposable);

    let viewChangeLogDisposable = vscode.commands.registerCommand('keploy.viewChangeLog', () => {
        // Logic to view the change log
        vscode.window.showInformationMessage('Feature coming soon!');
    }
    );
    context.subscriptions.push(viewChangeLogDisposable);

    let viewDocumentationDisposable = vscode.commands.registerCommand('keploy.viewDocumentation', () => {
        // Logic to view the documentation
        vscode.window.showInformationMessage('Feature coming soon!');
    }
    );
    context.subscriptions.push(viewDocumentationDisposable);


    let getLatestVersion = vscode.commands.registerCommand('keploy.getLatestVersion', () => {
        // Logic to get the latest version
        vscode.window.showInformationMessage('Feature coming soon!');
    }
    );
    context.subscriptions.push(getLatestVersion);

    let updateKeploy = vscode.commands.registerCommand('keploy.updateKeploy', () => {
        // Logic to get the latest version
        vscode.window.showInformationMessage('Feature coming soon!');
    }
    );
    context.subscriptions.push(updateKeploy);


}

export function deactivate() { }
