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
const SignIn_1 = __importDefault(require("./SignIn"));
const OneClickInstall_1 = __importDefault(require("./OneClickInstall"));
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
// This method is called when your extension is activated
function activate(context) {
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("Keploy-Sidebar", sidebarProvider), vscode.languages.registerCodeLensProvider({ language: 'javascript', scheme: 'file' }, new KeployCodeLensProvider()), vscode.languages.registerCodeLensProvider({ language: 'typescript', scheme: 'file' }, new KeployCodeLensProvider()));
    // Register the command
    let disposable = vscode.commands.registerCommand('keploy.doSomething', (uri) => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from Keploy!');
        (0, Utg_1.default)(context);
    });
    context.subscriptions.push(disposable);
    (0, OneClickInstall_1.default)();
    let signedIn = context.globalState.get('ourToken');
    console.log(context.globalState);
    if (signedIn) {
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
        sidebarProvider.postMessage('navigateToHome', 'KeployHome');
    }
    let signInCommand = vscode.commands.registerCommand('keploy.SignIn', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, SignIn_1.default)();
        context.globalState.update('accessToken', response.accessToken);
        vscode.window.showInformationMessage('You are now signed in!');
        vscode.commands.executeCommand('setContext', 'keploy.signedIn', true);
    }));
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
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map