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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const version_1 = require("./version");
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
    let hellocommand = vscode.commands.registerCommand('heykeploy.HeyKeploy', () => {
        vscode.window.showInformationMessage(`Hey Keploy Community!`);
    });
    context.subscriptions.push(hellocommand);
    let versioncommand = vscode.commands.registerCommand('heykeploy.KeployVersion', () => {
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