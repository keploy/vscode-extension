// import * as assert from 'assert';
import * as vscode from 'vscode';
import { SidebarProvider } from '../SidebarProvider';
import { strict as assert } from 'assert';
import sinon from 'sinon';


/// FakeWebview class for mocking
class FakeWebview {
  public html: string = '';
  
  // Mock implementation of asWebviewUri method
  public asWebviewUri(uri: vscode.Uri): vscode.Uri {
    return uri;
  }

  public postMessage(_: any) { }
  // Mock implementation of onDidReceiveMessage method
  public onDidReceiveMessage(listener: (message: any) => void): vscode.Disposable {
    // Mock implementation
    return {
      dispose: () => {} // Empty dispose method for simplicity
    };
  }
}

// FakeWebviewView class for mocking
class FakeWebviewView {
  public webview: FakeWebview;

  constructor(webview: FakeWebview) {
    this.webview = webview;
  }

  public dispose() { }

  
}


suite('Extension Test Suite', () => {
  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test('heykeploy.HeyKeploy command test', async () => {
    // Mocking the vscode.window.showInformationMessage function
    const showInformationMessage = vscode.window.showInformationMessage;
    vscode.window.showInformationMessage = (message: string) => {
      assert.strictEqual(message, 'Hey Keploy Community!');
      return Promise.resolve(undefined); // Return a resolved Promise
    };

    // Trigger the command
    await vscode.commands.executeCommand('heykeploy.HeyKeploy');

    // Restore original function
    vscode.window.showInformationMessage = showInformationMessage;
  });

  test('heykeploy.KeployVersion command test', async () => {
    // Mocking the vscode.window.createWebviewPanel function
    const createWebviewPanel = vscode.window.createWebviewPanel;
    vscode.window.createWebviewPanel = (
      viewType: string,
      title: string,
      showOptions: vscode.ViewColumn | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean | undefined; },
      options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
    ) => {
      let viewColumn: vscode.ViewColumn;
      if (typeof showOptions === 'number') {
        viewColumn = showOptions; // showOptions is of type vscode.ViewColumn
      } else {
        viewColumn = showOptions.viewColumn; // showOptions is an object containing viewColumn
      }
      assert.strictEqual(viewType, 'keployVersion');
      assert.strictEqual(title, 'Keploy Version');
      assert.strictEqual(viewColumn, vscode.ViewColumn.One);
      return {
        webview: {
          html: '', // Mock empty HTML
        },
        dispose: () => { }, // Mock dispose function
      } as vscode.WebviewPanel;
    };

    // Mocking the getKeployVersion function
    const getKeployVersion = () => Promise.resolve('1.0.0');

    // Trigger the command
    await vscode.commands.executeCommand('heykeploy.KeployVersion');

    // Restore original function
    vscode.window.createWebviewPanel = createWebviewPanel;
  });
});



suite('Sidebar Test Suite', () => {
  test('Sidebar Provider Registration', () => {
    const extensionUri = vscode.Uri.parse('fake://extension');
    const sidebarProvider = new SidebarProvider(extensionUri);

    const registerWebviewViewProviderSpy = sinon.spy(vscode.window, 'registerWebviewViewProvider');

    // Register the sidebar provider
    vscode.window.registerWebviewViewProvider(
      'Test-Sidebar',
      sidebarProvider
    );

    // Ensure that registerWebviewViewProvider was called with the correct arguments
    assert(registerWebviewViewProviderSpy.calledOnce);
    assert(
      registerWebviewViewProviderSpy.calledWith(
        'Test-Sidebar',
        sinon.match.instanceOf(SidebarProvider)
      )
    );

    // Clean up
    registerWebviewViewProviderSpy.restore();
  });

  test('Sidebar Content Rendering', async () => {
    const extensionUri = vscode.Uri.parse('http://www.example.com/some/path');
    const sidebarProvider = new SidebarProvider(extensionUri);
    const webview = new FakeWebview() as vscode.Webview;
    const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

    // Simulate the creation of the webview panel
    sidebarProvider.resolveWebviewView(view);
    // Ensure that the webview content is set correctly
    assert.strictEqual(webview.html.includes('<link href="http://www.example.com/some/path/media/vscode.css" rel="stylesheet">') , true);
  });
});
