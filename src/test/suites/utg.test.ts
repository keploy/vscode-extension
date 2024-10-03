// import { suite , test , setup , teardown } from "mocha";
// import assert from "assert";
// import * as sinon from "sinon";
// import * as Utg from "../../Utg";
// import * as vscode from "vscode";
// import path from "path";

// const createMockExtensionContext = (): vscode.ExtensionContext => ({
//     subscriptions: [],
//     extensionPath: '/mock/path',
//     extensionUri: vscode.Uri.parse('file:///mock/path'),
//     globalState: {
//         get: sinon.stub().returns('fakeToken'),
//         update: sinon.stub(),
//     },
//     workspaceState: {
//         get: sinon.stub(),
//         update: sinon.stub(),
//     },
//     asAbsolutePath: sinon.stub().returns('/mock/absolute/path'),
//     storagePath: '/mock/storage/path',
//     globalStoragePath: '/mock/global/storage/path',
//     logPath: '/mock/log/path',
// } as unknown as vscode.ExtensionContext);

// suite("Test Suite", () => {
//     let mockContext: vscode.ExtensionContext;
//     let createTerminalStub: sinon.SinonStub;
//     let activeTextEditorStub: sinon.SinonStub;
//     let mockMakeApiRequest: sinon.SinonStub;
//     let mockFsExistsSync: sinon.SinonStub;
//     let mockWriteFileSync: sinon.SinonStub;
//     let onDidCloseTerminalStub: sinon.SinonStub;
//     let setTimeoutStub: sinon.SinonStub;

//     let terminalMock: any;
//     let mockEditor: any;

//     setup(() => {
//         mockContext = createMockExtensionContext();
//         terminalMock = {
//             show: sinon.spy(),
//             sendText: sinon.spy(),
//         };
//         mockEditor = {
//             document: {
//                 uri: { fsPath: '/fake/path/to/file.js' }
//             }
//         };
//         createTerminalStub = sinon.stub(vscode.window, 'createTerminal').returns(terminalMock);
//         activeTextEditorStub = sinon.stub(vscode.window, 'activeTextEditor').value(mockEditor);
//         mockMakeApiRequest = sinon.stub(Utg,"makeApiRequest").resolves('{"usedCall": 5, "totalCall": 10}');
//         mockFsExistsSync = sinon.stub(require('fs'), 'existsSync');
//         mockWriteFileSync = sinon.stub(require('fs'), 'writeFileSync');
//     });

//     teardown(() => {
//         sinon.restore();
//     });

//     test("Test Utg running on js extension file", async function() {
//         mockFsExistsSync.returns(false);
//         onDidCloseTerminalStub = sinon.stub(vscode.window, 'onDidCloseTerminal').callsFake((callback) => {
//             setImmediate(() => callback(terminalMock));
//             return { dispose: sinon.spy() };
//         });

//         // setTimeoutStub = sinon.stub(global, 'setTimeout').callsFake((callback) => {
//         //     callback();
//         //     return 0 as unknown as NodeJS.Timeout;
//         // });

//         await Utg.default(mockContext);

//         assert(terminalMock.show.calledOnce, 'Terminal should be shown');
//         assert(mockFsExistsSync.calledOnce, 'Test file existence should be checked');
//         assert(mockWriteFileSync.calledOnce, 'Test file should be written');
//     });

//     // test("Test 2", () => {
        
//     // });
// });