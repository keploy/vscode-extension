import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import SignIn  from './SignIn';
import oneClickInstall from './OneClickInstall';
import { getKeployVersion , getCurrentKeployVersion } from './version';
import { downloadAndUpdate, downloadAndUpdateDocker } from './updateKeploy';
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
                    try{
                    await downloadAndUpdateDocker();
                        vscode.window.showInformationMessage('Keploy Docker updated!');
                }catch(error){
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

    
}

export function deactivate() {}
