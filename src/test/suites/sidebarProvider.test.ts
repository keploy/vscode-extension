import * as vscode from 'vscode';
import * as sinon from 'sinon';
import assert from 'assert';
import { suite, test, setup, teardown } from 'mocha';
import { SidebarProvider } from '../../SidebarProvider';
import fs from 'fs';
import { displayRecordedTestCases } from '../../Record';
import { displayTestCases } from '../../Test';

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
    public onDidReceiveMessage: sinon.SinonStub;

    constructor(data: any) {
        this.onDidReceiveMessage = sinon.stub().callsFake((callback: (data: any) => void) => {
            if (typeof callback === 'function') {
                callback(data);
            }
        });
    }

    public asWebviewUri(uri: vscode.Uri): vscode.Uri {
        return uri;
    }
    public postMessage(message: any): Thenable<boolean> {
        this.onDidReceiveMessage(message); // Trigger the spy with the message

        return Promise.resolve(true);
    }
}

class FakeWebviewView implements vscode.WebviewView {
    constructor(public webview: vscode.Webview) { }
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
    public dispose() { }
}

suite('Checking Sidebar Post Messages', () => {
    let mockContext: vscode.ExtensionContext;
    let extensionUri: vscode.Uri;
    let sandbox: sinon.SinonSandbox;
    let terminalMock: any;
    let createTerminalStub: sinon.SinonStub;

    setup(async () => {
        terminalMock = {
            show: sinon.spy(),
            sendText: sinon.spy(),
            dispose: sinon.spy()
        };

        createTerminalStub = sinon.stub(vscode.window, 'createTerminal').returns(terminalMock);
        sandbox = sinon.createSandbox();
        mockContext = createMockExtensionContext();
        extensionUri = vscode.Uri.parse('.');
    });

    teardown(() => {
        sinon.restore();
        sandbox.restore();
    });


    test('onInfo message should show Information Message', async () => {

        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: 'onInfo', value: 'Information message' }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        const showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(showInformationMessageStub.calledOnceWith('Information message'));
    });

    test('onError message should show Information Message', async () => {

        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: 'onError', value: 'Error Message' }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        const showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(showErrorMessageStub.calledOnceWith('Error Message'));
    });

    test("viewLogs", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "viewLogs", value: `logs/record_mode.log` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        const openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves();
        const showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument').resolves();

        await sidebarProvider.resolveWebviewView(view);

        const logfilePath = vscode.Uri.joinPath(extensionUri, "scripts", "logs/record_mode.log");

        // Have to check this later
        // assert.strict(openTextDocumentStub.calledWith(logfilePath));
        assert.strict(showTextDocumentStub.calledOnce);
    });

    test("startRecording", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "startRecordingCommand", value: `Recording Command...` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        process.env.SHELL = '/bin/bash';

        const command = `"/scripts/bash/keploy_record_script.sh" "/scripts/logs/record_mode.log" ;exit 0`

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(createTerminalStub.calledOnce);
        assert(createTerminalStub.firstCall.args[0].name, 'Keploy Terminal')
        assert.strict(createTerminalStub.firstCall.args[0].shellPath, '/bin/bash');
        assert.strict(terminalMock.show.calledOnce);
        assert.strict(terminalMock.sendText.calledWith(command));
        assert.strict(terminalMock.dispose.notCalled);
    });

    test("startTesting", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "startTestingCommand", value: `Testing Command...` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        process.env.SHELL = '/bin/bash';

        const command = `"/scripts/bash/keploy_test_script.sh" "/scripts/logs/test_mode.log" ; exit 0`

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(createTerminalStub.calledOnce);
        assert(createTerminalStub.firstCall.args[0].name, 'Keploy Terminal')
        assert.strict(createTerminalStub.firstCall.args[0].shellPath, '/bin/bash');
        assert.strict(terminalMock.show.calledOnce);
        assert.strict(terminalMock.sendText.calledWith(command));
        assert.strict(terminalMock.dispose.notCalled);
    });

    test("startRecording with zsh", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "startRecordingCommand", value: `Recording Command...` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        process.env.SHELL = '/bin/zsh';

        const command = `"/scripts/zsh/keploy_record_script.sh" "/scripts/logs/record_mode.log" ;exit 0`

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(createTerminalStub.calledOnce);
        assert(createTerminalStub.firstCall.args[0].name, 'Keploy Terminal')
        assert.strict(createTerminalStub.firstCall.args[0].shellPath, '/bin/zsh');
        assert.strict(terminalMock.show.calledOnce);
        assert.strict(terminalMock.sendText.calledWith(command));
        assert.strict(terminalMock.dispose.notCalled);
    });

    test("startTesting with zsh", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "startTestingCommand", value: `Testing Command...` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        process.env.SHELL = '/bin/zsh';

        const command = `"/scripts/zsh/keploy_test_script.sh" "/scripts/logs/test_mode.log"; exit 0`

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(createTerminalStub.calledOnce);
        assert(createTerminalStub.firstCall.args[0].name, 'Keploy Terminal')
        assert.strict(createTerminalStub.firstCall.args[0].shellPath, '/bin/zsh');
        assert.strict(terminalMock.show.calledOnce);
        assert.strict(terminalMock.sendText.calledWith(command));
        assert.strict(terminalMock.dispose.notCalled);
    });

    test("stopTesting", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "stopTestingCommand", value: `Testing Command...` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;
        const terminalsStub = sinon.stub(vscode.window, 'terminals').value([{ name: 'Keploy Terminal', processId: 1234 , ...terminalMock }]);

        await sidebarProvider.resolveWebviewView(view);

        assert.strict(terminalMock.sendText.calledWith('\x03', true));
    });

    // Testing displayRecordTestCases independently as it is being called after terminal get's closed which is also triggered by stopRecording button in frontend
    test("displayRecordTestCases should make request to post message with correct value", async () => {
        const webview = new FakeWebview({ type: "stopRecordingCommand", value: `Recording Command...` }) as vscode.Webview;
        const readFileSyncStub = sandbox.stub(fs, 'readFileSync').returns('');

        const postMessageSpy = sandbox.spy(webview, 'postMessage');
        displayRecordedTestCases('', webview);

        assert.strict(postMessageSpy.calledOnce);

        const payload = {
            type: 'testcaserecorded',
            value: 'Test Case has been recorded',
            textContent: "No test cases captured. Please try again.",
            noTestCases: true
        };

        assert.strict(postMessageSpy.calledWith(payload));
    });

    test("displayTestCases should make request to post message with correct value", async () => {
        const webview = new FakeWebview({ type: "stopRecordingCommand", value: `Recording Command...` }) as vscode.Webview;
        const readFileSyncStub = sandbox.stub(fs, 'readFileSync').returns('');

        const postMessageSpy = sandbox.spy(webview, 'postMessage');
        displayTestCases('', webview,false,true);

        assert.strict(postMessageSpy.calledOnce);

        const payload = {
            type: 'testResults',
            value: 'Test Failed',
            textSummary: "Error Replaying Test Cases. Please try again.",
            error: true,
            isHomePage: false,
            isCompleteSummary: true
        };

        assert.strict(postMessageSpy.calledWith(payload));
    });

    test("navigate to UtgDocs", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "navigate", value: `UtgDocs` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        await sidebarProvider.resolveWebviewView(view);

        assert(webview.html.includes("UtgDocs.js"));
    });

    test("navigate to Home", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "navigate", value: `IntegrationTest` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        const existsSyncStub = sinon.stub(fs, "existsSync").returns(true);

        await sidebarProvider.resolveWebviewView(view);

        assert(webview.html.includes("KeployHome.js"));
    });

    test("navigate to Integration", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "navigate", value: `IntegrationTest` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        const existsSyncStub = sinon.stub(fs, "existsSync").returns(false);

        await sidebarProvider.resolveWebviewView(view);

        assert(webview.html.includes("IntegrationTest.js"));
    });

    test("navigate to Config", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "navigate", value: `Config` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        await sidebarProvider.resolveWebviewView(view);

        assert(webview.html.includes("Config.js"));
    });

    test("navigate to Option", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "navigate", value: `Option` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        await sidebarProvider.resolveWebviewView(view);

        assert(webview.html.includes("Option.js"));
    });

    test("navigate to KeployHome", async () => {
        const sidebarProvider = new SidebarProvider(extensionUri, mockContext);
        const webview = new FakeWebview({ type: "navigate", value: `KeployHome` }) as vscode.Webview;
        const view = new FakeWebviewView(webview) as unknown as vscode.WebviewView;

        await sidebarProvider.resolveWebviewView(view);

        assert(webview.html.includes("KeployHome.js"));
    });
});
