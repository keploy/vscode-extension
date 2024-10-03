import * as vscode from 'vscode';
import * as sinon from 'sinon';
import assert from 'assert';
import fs from 'fs';
import { handleInitializeKeployConfigFile, handleOpenKeployConfigFile } from '../../Config';

describe('handleOpenKeployConfigFile', () => {
    let workspaceStub: sinon.SinonStub;
    let openTextDocumentStub: sinon.SinonStub;
    let showTextDocumentStub: sinon.SinonStub;
    let existsSyncStub: sinon.SinonStub;
    let createTerminalStub: sinon.SinonStub;
    let sendTextStub: sinon.SinonStub;
    let showTerminalStub: sinon.SinonStub;

    beforeEach(() => {
        workspaceStub = sinon.stub(vscode.workspace, 'workspaceFolders').value([{ uri: { fsPath: '/path/to/workspace' } }]);
        openTextDocumentStub = sinon.stub(vscode.workspace, 'openTextDocument').resolves({} as any);
        showTextDocumentStub = sinon.stub(vscode.window, 'showTextDocument').resolves();
        existsSyncStub = sinon.stub().returns(false);
        createTerminalStub = sinon.stub(vscode.window, 'createTerminal').returns({
            sendText: sendTextStub = sinon.stub(),
            show: showTerminalStub = sinon.stub(),
        } as any);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should open the config file if it exists', async () => {
        existsSyncStub.returns(true);
        sinon.stub(fs, 'existsSync').callsFake(existsSyncStub);

        const webview = { postMessage: sinon.spy() };
        await handleOpenKeployConfigFile(webview);

        assert(openTextDocumentStub.calledOnceWith('/path/to/workspace/keploy.yml'));
        assert(showTextDocumentStub.calledOnce);
    });

    // Maybe problem with code will have to check
    // it('should create a terminal and generate the config if it does not exist', async () => {
    //     existsSyncStub.returns(false);  // Simulate config file does not exist
    //     sinon.stub(fs, 'existsSync').callsFake(existsSyncStub);  // Stub existsSync function

    //     const webview = { postMessage: sinon.spy() };
    //     const promise = handleOpenKeployConfigFile(webview);

    //     assert(createTerminalStub.calledOnce);
    //     assert(sendTextStub.calledOnceWith('keploy config --generate; exit 0'));
    //     assert(showTerminalStub.calledOnce);

    //     await promise;
    // });

});

// describe('handleInitializeKeployConfigFile', () => {

//     it('should redirect after initialising config', async () => {
//         const webview = { postMessage: sinon.spy() };

//         await handleInitializeKeployConfigFile(webview, './', 'npm run start');

//         assert(webview.postMessage.calledOnceWith({ type: 'navigateToHome', value: 'KeployHome' }));
//     });
// });
