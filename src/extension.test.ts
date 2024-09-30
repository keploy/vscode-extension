import assert = require('assert');
import * as vscode from 'vscode';
import sinon from 'sinon';
import { SidebarProvider } from './SidebarProvider';

const createMockExtensionContext = (): vscode.ExtensionContext => ({
  subscriptions: [],
  extensionPath: '/mock/path',
  extensionUri: vscode.Uri.parse('file:///mock/path'),
  globalState: {
    get: sinon.stub(),
    update: sinon.stub(),
  },
  workspaceState: {
    get: sinon.stub(),
    update: sinon.stub(),
  },
  asAbsolutePath: sinon.stub().returns('/mock/absolute/path'),
  storagePath: '/mock/storage/path',
  globalStoragePath: '/mock/global/storage/path',
  logPath: '/mock/log/path',
} as unknown as vscode.ExtensionContext);

// Mock classes for FakeWebview and FakeWebviewView to simulate behavior
class FakeWebview implements vscode.Webview {
  public html = '';
  public options = {};
  public cspSource = '';
  public onDidReceiveMessage = sinon.spy();
  public asWebviewUri(uri: vscode.Uri): vscode.Uri {
    return uri;
  }
  public postMessage(message: any): Thenable<boolean> {
    this.onDidReceiveMessage(message); // Trigger the spy with the message
    return Promise.resolve(true);
  }
}

class FakeWebviewView implements vscode.WebviewView {
  constructor(public webview: vscode.Webview) {}
	viewType: any;
	badge?: vscode.ViewBadge | undefined;
	show(preserveFocus?: boolean): void {
		throw new Error('Method not implemented.');
	}
  public title = '';
  public description = '';
  public onDidDispose = sinon.spy();
  public onDidChangeVisibility = sinon.spy();
  public onDidChangeViewState = sinon.spy();
  public visible = true;
  public dispose() {}
}

suite('Sidebar Test Suite', () => {

  let mockContext: vscode.ExtensionContext;
  let extensionUri: vscode.Uri;

  setup(() => {
    mockContext = createMockExtensionContext();
    extensionUri = vscode.Uri.parse('http://www.example.com/some/path');
  });

  test('Sidebar Provider Registration', () => {
    const sidebarProvider = new SidebarProvider(extensionUri, mockContext);

    const registerWebviewViewProviderSpy = sinon.spy(vscode.window, 'registerWebviewViewProvider');

    vscode.window.registerWebviewViewProvider('Test-Sidebar', sidebarProvider);

    assert(registerWebviewViewProviderSpy.calledOnce);
    assert(
      registerWebviewViewProviderSpy.calledWith(
        'Test-Sidebar',
        sinon.match.instanceOf(SidebarProvider)
      )
    );

    registerWebviewViewProviderSpy.restore();
  });
  

  test('Sidebar Content Rendering', async () => {
    const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
    const webview = new FakeWebview() as vscode.Webview;
    const view = new FakeWebviewView(webview) as vscode.WebviewView;

    await sidebarProvider.resolveWebviewView(view);

    assert.strictEqual(
      webview.html.includes('<link href="http://www.example.com/some/path/media/vscode.css" rel="stylesheet">'),
      true
    );
	// Clean up

  });

  test('Sidebar Comprehensive Functionality', async () => {
    const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
    const webview = new FakeWebview() as vscode.Webview;
    const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

    await sidebarProvider.resolveWebviewView(view);

    // Simulate the creation of the webview panel
    assert.strictEqual(webview.html.includes('<!DOCTYPE html>'), true, 'DOCTYPE is missing');
    assert.strictEqual(webview.html.includes('<html lang="en">'), true, 'HTML tag is missing');
    assert.strictEqual(webview.html.includes('<head>'), true, 'Head tag is missing');
    assert.strictEqual(webview.html.includes('<meta charset="UTF-8">'), true, 'UTF-8 charset meta tag is missing');
    assert.strictEqual(webview.html.includes('<meta http-equiv="Content-Security-Policy"'), true, 'Content Security Policy meta tag is missing');
    assert.strictEqual(webview.html.includes('<meta name="viewport"'), true, 'Viewport meta tag is missing');

    // Test if all required stylesheets are being loaded
    assert.strictEqual(webview.html.includes('http://www.example.com/some/path/media/reset.css'), true, 'Reset CSS is missing');
    assert.strictEqual(webview.html.includes('http://www.example.com/some/path/media/vscode.css'), true, 'VS Code CSS is missing');
    assert.strictEqual(webview.html.includes('http://www.example.com/some/path/sidebar/sidebar.css'), true, 'Sidebar CSS is missing');
    assert.strictEqual(webview.html.includes('http://www.example.com/some/path/out/compiled/Config.css'), true, 'Config CSS is missing');

    // Test if Google Fonts are being loaded
    assert.strictEqual(webview.html.includes('https://fonts.googleapis.com'), true, 'Google Fonts preconnect is missing');
    assert.strictEqual(webview.html.includes('https://fonts.gstatic.com'), true, 'Google Fonts static preconnect is missing');
    assert.strictEqual(webview.html.includes('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap'), true, 'Baloo 2 font is missing');

    // Clean up
   
  });

  
});
function expect(count: any) {
	throw new Error('Function not implemented.');
}

