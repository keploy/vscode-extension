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
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
suite('Extension Test Suite', () => {
    test('Initial Test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
    test('Extension Commands Test', () => __awaiter(void 0, void 0, void 0, function* () {
        const context = {
            subscriptions: [],
            extensionPath: '',
            extensionUri: vscode.Uri.parse(''),
            asAbsolutePath: () => '',
            storagePath: '',
            globalStoragePath: '',
            logPath: '',
            storageUri: vscode.Uri.parse(''),
            globalStorageUri: vscode.Uri.parse(''),
            logUri: vscode.Uri.parse(''),
            extensionMode: vscode.ExtensionMode.Production,
            extension: {
                extensionPath: '',
                id: '',
                isActive: true,
                packageJSON: {},
                activate: () => Promise.resolve(),
                exports: {},
                extensionKind: vscode.ExtensionKind.UI,
                extensionUri: vscode.Uri.parse(''),
            },
            asWebviewUri: () => vscode.Uri.parse(''),
            extensionRuntime: vscode.ExtensionRuntime.Node,
            subscriptionsDisposed: false,
            globalStorage: {
                get: () => { },
                update: () => { },
                setKeysForSync: () => { },
                setValuesForSync: () => { },
                getKeysForSync: () => [],
                getValuesForSync: () => [],
                onDidChange: () => { },
                onDidChangeKeys: () => { },
                onDidChangeValues: () => { },
                dispose: () => { },
            },
            workspaceStatePath: '',
            globalStatePath: '',
            logPathFile: '',
            storagePathFile: '',
            globalStoragePathFile: '',
            storageUriFile: vscode.Uri.parse(''),
            globalStorageUriFile: vscode.Uri.parse(''),
            logUriFile: vscode.Uri.parse(''),
            workspaceStateFile: {
                get: () => { },
                update: () => { },
                setKeysForSync: () => { },
                setValuesForSync: () => { },
                getKeysForSync: () => [],
                getValuesForSync: () => [],
                onDidChange: () => { },
                onDidChangeKeys: () => { },
                onDidChangeValues: () => { },
                dispose: () => { },
            },
            globalStateFile: {
                get: () => { },
                update: () => { },
                setKeysForSync: () => { },
                setValuesForSync: () => { },
                getKeysForSync: () => [],
                getValuesForSync: () => [],
                onDidChange: () => { },
                onDidChangeKeys: () => { },
                onDidChangeValues: () => { },
                dispose: () => { },
            },
            extensionRuntimeFile: vscode.ExtensionRuntime.Node,
            extensionFile: {
                extensionPath: '',
                id: '',
                isActive: true,
                packageJSON: {},
                activate: () => { },
                exports: {},
                extensionKind: vscode.ExtensionKind.UI,
            },
            asWebviewUriFile: () => vscode.Uri.parse(''),
            extensionModeFile: vscode.ExtensionMode.Production,
            environmentVariableCollectionFile: {
                replace: () => { },
                append: () => { },
                prepend: () => { },
                get: () => { },
                forEach: () => { },
                clear: () => { },
                delete: () => { },
                dispose: () => { },
            },
            extensionKind: vscode.ExtensionKind.UI,
        };
        // Test 'heykeploy.HeyKeploy' command
        const helloCommand = vscode.commands.getCommands().then((commands) => {
            assert.ok(commands.includes('heykeploy.HeyKeploy'));
            return vscode.commands.executeCommand('heykeploy.HeyKeploy');
        });
        yield helloCommand;
        // Test 'heykeploy.KeployVersion' command
        const versionCommand = vscode.commands.getCommands().then((commands) => {
            assert.ok(commands.includes('heykeploy.KeployVersion'));
            return vscode.commands.executeCommand('heykeploy.KeployVersion');
        });
        yield versionCommand;
        // Test 'Keploy-Sidebar' view provider
        const sidebarProvider = vscode.window.registerWebviewViewProvider('Keploy-Sidebar', {
            resolveWebviewView: () => {
                return {
                    webview: {
                        html: '',
                        onDidReceiveMessage: () => { },
                        postMessage: () => { },
                        asWebviewUri: () => vscode.Uri.parse(''),
                        cspSource: '',
                        options: {},
                        state: {},
                        dispose: () => { },
                    },
                    onDidChangeVisibility: () => { },
                    onDidChangeViewState: () => { },
                    title: '',
                    description: '',
                    webviewViewType: '',
                    visible: true,
                    active: true,
                    visibleRange: {
                        start: 0,
                        end: 0,
                    },
                    dispose: () => { },
                };
            },
        });
        assert.ok(sidebarProvider);
    }));
});
// extension.test.ts
// import * as assert from 'assert';
// import * as vscode from 'vscode';
// suite('Extension Test Suite', () => {
//   test('Initial Test', () => {
//     assert.strictEqual(-1, [1, 2, 3].indexOf(5));
//     assert.strictEqual(-1, [1, 2, 3].indexOf(0));
//   });
//   test('Extension Commands Test', async () => {
//     // Test your extension's functionality here
//     await vscode.commands.executeCommand('heykeploy.KeployVersion');
//     await vscode.commands.executeCommand('heykeploy.HeyKeploy');
//   });
// });
// // extension.test.ts
//# sourceMappingURL=extension.test.js.map