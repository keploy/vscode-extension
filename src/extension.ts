import * as vscode from 'vscode';
import {getKeployVersion} from './version';
import { SidebarProvider } from './SidebarProvider';


export function activate(context: vscode.ExtensionContext) {
    const logo = `
       ▓██▓▄
    ▓▓▓▓██▓█▓▄
     ████████▓▒
          ▀▓▓███▄      ▄▄   ▄               ▌
         ▄▌▌▓▓████▄    ██ ▓█▀  ▄▌▀▄  ▓▓▌▄   ▓█  ▄▌▓▓▌▄ ▌▌   ▓
       ▓█████████▌▓▓   ██▓█▄  ▓█▄▓▓ ▐█▌  ██ ▓█  █▌  ██  █▌ █▓
      ▓▓▓▓▀▀▀▀▓▓▓▓▓▓▌  ██  █▓  ▓▌▄▄ ▐█▓▄▓█▀ █▓█ ▀█▄▄█▀   █▓█
       ▓▌                           ▐█▌                   █▌
        ▓
`;

    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "Keploy-Sidebar",
            sidebarProvider
        )
    );
    

    let hellocommand = vscode.commands.registerCommand('heykeploy.HeyKeploy', () => {
        vscode.window.showInformationMessage(`Hey Keploy Community!`);
    });

    context.subscriptions.push(hellocommand);

    let versioncommand = vscode.commands.registerCommand('heykeploy.KeployVersion', () => {
        const panel = vscode.window.createWebviewPanel(
            'keployVersion', // Identifies the type of the webview. Used internally
            'Keploy Version', // Title of the panel displayed to the webviewuser
            vscode.ViewColumn.One, // Editor column to show the new  panel in
            {}
        );


        // Get the Keploy version and update the Webview content
        getKeployVersion().then(version => {
            panel.webview.html = `
                <html>
                    <body>
						<pre>${logo}</pre>
                        <h1>The latest version of Keploy is ${version}</h1>
						<h1>View the latest version at <a href="https://github.com/keploy/keploy"> Keploy GitHub</a></h1>
                    </body>
                </html>
            `;
        }).catch(error => {
            // Display error message in case of failure
            vscode.window.showErrorMessage(`Error fetching Keploy version: ${error}`);
        });
    }
    );

    context.subscriptions.push(versioncommand);

}

// This method is called when your extension is deactivated
export function deactivate() { }
