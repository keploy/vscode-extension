import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {

    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "App-Sidebar",
            sidebarProvider
        )
    );

    let helloCommand = vscode.commands.registerCommand('run.RunApp', () => {
        vscode.window.showInformationMessage(`Hey App Community!`);
    });
    context.subscriptions.push(helloCommand);

    let getLatestAppDisposable = vscode.commands.registerCommand('run.currentVersion', () => {
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(getLatestAppDisposable);

    let viewChangeLogDisposable = vscode.commands.registerCommand('run.viewChangeLog', () => {
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(viewChangeLogDisposable);

    let openDocsDisposable = vscode.commands.registerCommand('run.openDocs', () => {
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(openDocsDisposable);

    let updateAppDisposable = vscode.commands.registerCommand('run.updateApp', () => {
        const options = [
            { label: "App Docker", description: "Update using App Docker" },
            { label: "App Binary", description: "Update using App Binary" }
        ];

        vscode.window.showQuickPick(options, {
            placeHolder: "Choose how to update App"
        }).then(async selection => {
            if (selection) {
                if (selection.label === "App Docker") {
                    try {
                        vscode.window.showInformationMessage('App Docker updated!');
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to update App Docker: ${error}`);
                    }
                } else if (selection.label === "App Binary") {
                    try {                        
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to update App binary: ${error}`);
                    }
                }
            }
        });
    });
    context.subscriptions.push(updateAppDisposable);

    let versionCommand = vscode.commands.registerCommand('run.updateLatest', () => {
        const panel = vscode.window.createWebviewPanel(
            'appVersion',
            'App Version',
            vscode.ViewColumn.One,
            {}
        );
    });
    context.subscriptions.push(versionCommand);
}
export function deactivate() {}
