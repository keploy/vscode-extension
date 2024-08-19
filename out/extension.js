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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const SidebarProvider_1 = require("./SidebarProvider");
const OneClickInstall_1 = __importDefault(require("./OneClickInstall"));
const version_1 = require("./version");
const updateKeploy_1 = require("./updateKeploy");
const Utg_1 = __importDefault(require("./Utg"));
const acorn = __importStar(require("acorn"));
const walk = __importStar(require("acorn-walk"));
class KeployCodeLensProvider {
    provideCodeLenses(document, token) {
        const fileName = document.uri.fsPath;
        if (fileName.endsWith('.test.js') || fileName.endsWith('.test.ts')) {
            return [];
        }
        const text = document.getText();
        const codeLenses = [];
        try {
            const ast = acorn.parse(text, { ecmaVersion: 2020, sourceType: 'module' });
            walk.fullAncestor(ast, (node, state, ancestors) => {
                var _a, _b;
                if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                    const line = document.positionAt(node.start).line;
                    const range = new vscode.Range(line, 0, line, 0);
                    codeLenses.push(new vscode.CodeLens(range, {
                        title: '🐰 Generate unit tests',
                        command: 'keploy.doSomething',
                        arguments: [document.uri.fsPath]
                    }));
                }
                else if (node.type === 'ArrowFunctionExpression') {
                    const parent = ancestors[ancestors.length - 2];
                    if (parent.type !== 'CallExpression' || (((_a = parent.callee.property) === null || _a === void 0 ? void 0 : _a.name) !== 'then' && ((_b = parent.callee.property) === null || _b === void 0 ? void 0 : _b.name) !== 'catch')) {
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
        }
        catch (error) {
            console.error(error);
        }
        return codeLenses;
    }
}
function activate(context) {
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("Keploy-Sidebar", sidebarProvider), vscode.languages.registerCodeLensProvider({ language: 'javascript', scheme: 'file' }, new KeployCodeLensProvider()), vscode.languages.registerCodeLensProvider({ language: 'typescript', scheme: 'file' }, new KeployCodeLensProvider()));
    (0, OneClickInstall_1.default)();
    let signedIn = context.globalState.get('ourToken');
    console.log(context.globalState);
    if (signedIn) {
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
        sidebarProvider.postMessage('navigateToHome', 'KeployHome');
    }
    // disable if access token is already present
    // let signInCommand = vscode.commands.registerCommand('keploy.SignIn', async () => {
    //     getGitHubAccessToken().then((result) => {
    //         if (result) {
    //             const { accessToken, email } = result;
    //             console.log('Access Token:', accessToken);
    //             console.log('Email:', email);
    //             getInstallationID();
    //             // Use the access token and email as needed
    //         } else {
    //             console.log('Failed to get the session or email.');
    //         }
    //     });
    //     // context.globalState.update('accessToken', response.accessToken);
    //     vscode.window.showInformationMessage('You are now signed in!');
    //     vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
    // }
    // );
    // context.subscriptions.push(signInCommand);
    let viewKeployVersionDisposable = vscode.commands.registerCommand('keploy.KeployVersion', () => __awaiter(this, void 0, void 0, function* () {
        const currentVersion = yield (0, version_1.getCurrentKeployVersion)();
        vscode.window.showInformationMessage(`The current version of Keploy is ${currentVersion}`);
    }));
    context.subscriptions.push(viewKeployVersionDisposable);
    let viewChangeLogDisposable = vscode.commands.registerCommand('keploy.viewChangeLog', () => {
        const changeLogUrl = 'https://marketplace.visualstudio.com/items?itemName=Keploy.keployio';
        vscode.env.openExternal(vscode.Uri.parse(changeLogUrl));
    });
    context.subscriptions.push(viewChangeLogDisposable);
    let viewDocumentationDisposable = vscode.commands.registerCommand('keploy.viewDocumentation', () => {
        const docsUrl = 'https://keploy.io/docs/';
        vscode.env.openExternal(vscode.Uri.parse(docsUrl));
    });
    context.subscriptions.push(viewDocumentationDisposable);
    let getLatestVersion = vscode.commands.registerCommand('keploy.getLatestVersion', () => __awaiter(this, void 0, void 0, function* () {
        const latestVersion = yield (0, version_1.getKeployVersion)();
        vscode.window.showInformationMessage(`The latest version of Keploy is ${latestVersion}`);
    }));
    context.subscriptions.push(getLatestVersion);
    let updateKeployDisposable = vscode.commands.registerCommand('keploy.updateKeploy', () => {
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
    // Register the command
    let disposable = vscode.commands.registerCommand('keploy.doSomething', (uri) => __awaiter(this, void 0, void 0, function* () {
        // Display a message box to the user
        vscode.window.showInformationMessage('Welcome to Keploy!');
        yield (0, Utg_1.default)(context);
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function performAuthenticatedTasks(token) {
    // Perform tasks that require authentication
    console.log('Performing authenticated tasks with token:', token);
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map