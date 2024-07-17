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
function activate(context) {
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("Keploy-Sidebar", sidebarProvider));
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
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map