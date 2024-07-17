import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import SignIn  from './SignIn';
import oneClickInstall from './OneClickInstall';

export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                "Keploy-Sidebar",
                sidebarProvider
            )
        );
    oneClickInstall();
    
    let signedIn = context.globalState.get('ourToken');
    console.log(context.globalState);
    if(signedIn){
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
        sidebarProvider.postMessage('navigateToHome','KeployHome');
    }
    	let signInCommand = vscode.commands.registerCommand('keploy.SignIn', async () => {
           
            const response : any = await SignIn();
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
	
}

export function deactivate() {}
