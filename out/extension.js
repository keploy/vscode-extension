"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const version_1 = require("./version");
const updateKeploy_1 = require("./updateKeploy");
const SidebarProvider_1 = require("./SidebarProvider");
function activate(context) {
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
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("Keploy-Sidebar", sidebarProvider));
    let updateKeployDisposable = vscode.commands.registerCommand('heykeploy.updateKeploy', () => {
        //open popup to ask user to choose beteween keploy docker or keploy binary
        const options = [
            { label: "Keploy Docker", description: "Update using Keploy Docker" },
            { label: "Keploy Binary", description: "Update using Keploy Binary" }
        ];
        vscode.window.showQuickPick(options, {
            placeHolder: "Choose how to update Keploy"
        }).then((selection) => __awaiter(this, void 0, void 0, function* () {
            if (selection) {
                // Handle the user's choice here
                if (selection.label === "Keploy Docker") {
                    try {
                        yield (0, updateKeploy_1.downloadAndUpdateDocker)();
                        vscode.window.showInformationMessage('Keploy Docker updated!');
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to update Keploy Docker: ${error}`);
                    }
                }
                else if (selection.label === "Keploy Binary") {
                    try {
                        yield (0, updateKeploy_1.downloadAndUpdate)();
                        // this._view?.webview.postMessage({ type: 'success', value: 'Keploy binary updated!' });
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to update Keploy binary: ${error}`);
                    }
                }
            }
        }));
    });
    context.subscriptions.push(updateKeployDisposable);
    let getLatestKeployDisposable = vscode.commands.registerCommand('heykeploy.KeployVersion', () => {
        // Logic to get the latest Keploy
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(getLatestKeployDisposable);
    let viewChangeLogDisposable = vscode.commands.registerCommand('heykeploy.viewChangeLog', () => {
        // Logic to view the change log
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(viewChangeLogDisposable);
    let viewDocumentationDisposable = vscode.commands.registerCommand('heykeploy.viewDocumentation', () => {
        // Logic to view the documentation
        vscode.window.showInformationMessage('Feature coming soon!');
    });
    context.subscriptions.push(viewDocumentationDisposable);
    let hellocommand = vscode.commands.registerCommand('heykeploy.HeyKeploy', () => {
        vscode.window.showInformationMessage(`Hey Keploy Community!`);
    });
    context.subscriptions.push(hellocommand);
    let versioncommand = vscode.commands.registerCommand('heykeploy.getLatestVersion', () => {
        const panel = vscode.window.createWebviewPanel('keployVersion', // Identifies the type of the webview. Used internally
        'Keploy Version', // Title of the panel displayed to the webviewuser
        vscode.ViewColumn.One, // Editor column to show the new  panel in
        {});
        // Get the Keploy version and update the Webview content
        (0, version_1.getKeployVersion)().then(version => {
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
    });
    context.subscriptions.push(versioncommand);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map