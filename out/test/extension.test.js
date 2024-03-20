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
// import * as assert from 'assert';
const vscode = __importStar(require("vscode"));
const SidebarProvider_1 = require("../SidebarProvider");
const assert_1 = require("assert");
const sinon_1 = __importDefault(require("sinon"));
/// FakeWebview class for mocking
class FakeWebview {
    constructor() {
        this.html = '';
    }
    // Mock implementation of asWebviewUri method
    asWebviewUri(uri) {
        return uri;
    }
    postMessage(_) { }
    // Mock implementation of onDidReceiveMessage method
    onDidReceiveMessage(listener) {
        // Mock implementation
        return {
            dispose: () => { } // Empty dispose method for simplicity
        };
    }
}
// FakeWebviewView class for mocking
class FakeWebviewView {
    constructor(webview) {
        this.webview = webview;
    }
    dispose() { }
}
suite('Extension Test Suite', () => {
    test('Sample test', () => {
        assert_1.strict.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert_1.strict.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
    test('heykeploy.HeyKeploy command test', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking the vscode.window.showInformationMessage function
        const showInformationMessage = vscode.window.showInformationMessage;
        vscode.window.showInformationMessage = (message) => {
            assert_1.strict.strictEqual(message, 'Hey Keploy Community!');
            return Promise.resolve(undefined); // Return a resolved Promise
        };
        // Trigger the command
        yield vscode.commands.executeCommand('heykeploy.HeyKeploy');
        // Restore original function
        vscode.window.showInformationMessage = showInformationMessage;
    }));
    test('heykeploy.KeployVersion command test', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking the vscode.window.createWebviewPanel function
        const createWebviewPanel = vscode.window.createWebviewPanel;
        vscode.window.createWebviewPanel = (viewType, title, showOptions, options) => {
            let viewColumn;
            if (typeof showOptions === 'number') {
                viewColumn = showOptions; // showOptions is of type vscode.ViewColumn
            }
            else {
                viewColumn = showOptions.viewColumn; // showOptions is an object containing viewColumn
            }
            assert_1.strict.strictEqual(viewType, 'keployVersion');
            assert_1.strict.strictEqual(title, 'Keploy Version');
            assert_1.strict.strictEqual(viewColumn, vscode.ViewColumn.One);
            return {
                webview: {
                    html: '', // Mock empty HTML
                },
                dispose: () => { }, // Mock dispose function
            };
        };
        // Mocking the getKeployVersion function
        const getKeployVersion = () => Promise.resolve('1.0.0');
        // Trigger the command
        yield vscode.commands.executeCommand('heykeploy.KeployVersion');
        // Restore original function
        vscode.window.createWebviewPanel = createWebviewPanel;
    }));
});
suite('Sidebar Test Suite', () => {
    test('Sidebar Provider Registration', () => {
        const extensionUri = vscode.Uri.parse('fake://extension');
        const sidebarProvider = new SidebarProvider_1.SidebarProvider(extensionUri);
        const registerWebviewViewProviderSpy = sinon_1.default.spy(vscode.window, 'registerWebviewViewProvider');
        // Register the sidebar provider
        vscode.window.registerWebviewViewProvider('Test-Sidebar', sidebarProvider);
        // Ensure that registerWebviewViewProvider was called with the correct arguments
        (0, assert_1.strict)(registerWebviewViewProviderSpy.calledOnce);
        (0, assert_1.strict)(registerWebviewViewProviderSpy.calledWith('Test-Sidebar', sinon_1.default.match.instanceOf(SidebarProvider_1.SidebarProvider)));
        // Clean up
        registerWebviewViewProviderSpy.restore();
    });
    test('Sidebar Content Rendering', () => __awaiter(void 0, void 0, void 0, function* () {
        const extensionUri = vscode.Uri.parse('http://www.example.com/some/path');
        const sidebarProvider = new SidebarProvider_1.SidebarProvider(extensionUri);
        const webview = new FakeWebview();
        const view = new FakeWebviewView(webview);
        // Simulate the creation of the webview panel
        sidebarProvider.resolveWebviewView(view);
        // Ensure that the webview content is set correctly
        assert_1.strict.strictEqual(webview.html.includes('<link href="http://www.example.com/some/path/media/vscode.css" rel="stylesheet">'), true);
    }));
});
//# sourceMappingURL=extension.test.js.map