import assert from "assert";
import * as updateKeploy from "../../updateKeploy";
import * as version from "../../version"
import { suite, test, setup, teardown } from "mocha";
import vscode from "vscode";
import sinon from "sinon";

suite("updateKeploy Test", function () {

    let createTerminalStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let onDidCloseTerminalStub: sinon.SinonStub;
    let terminalMock: any;

    setup(() => {
        terminalMock = {
            show: sinon.spy(),
            sendText: sinon.spy(),
        };

        createTerminalStub = sinon.stub(vscode.window, 'createTerminal').returns(terminalMock);
        showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        onDidCloseTerminalStub = sinon.stub(vscode.window, 'onDidCloseTerminal');
    });

    teardown(() => {
        createTerminalStub.restore();
        showInformationMessageStub.restore();
        onDidCloseTerminalStub.restore();
    });

    test('should create a terminal and run the curl command on non-Windows platform', async () => {
        sinon.stub(process, 'platform').value('linux');

        let terminalCloseListener: Function | undefined;
        onDidCloseTerminalStub.callsFake((listener) => {
            terminalCloseListener = listener;
            return { dispose: sinon.spy() };
        });

        const promise = updateKeploy.downloadAndInstallKeployBinary();

        assert.strictEqual(createTerminalStub.calledOnce, true);
        assert.strictEqual(createTerminalStub.firstCall.args[0].shellPath, '/bin/bash');
        assert.strictEqual(terminalMock.sendText.calledOnceWith(" curl --silent -O -L https://keploy.io/install.sh && source install.sh;exit 0"), true);
        assert.strictEqual(terminalMock.show.calledOnce, true);
        assert.strictEqual(showInformationMessageStub.calledOnceWith('Downloading and updating Keploy binary...'), true);

        if (terminalCloseListener) {
            terminalCloseListener(terminalMock);
        }

        await promise;
    });

    test('should create a terminal with WSL on Windows platform', async () => {
        sinon.stub(process, 'platform').value('win32');

        let terminalCloseListener: Function | undefined;
        onDidCloseTerminalStub.callsFake((listener) => {
            terminalCloseListener = listener;
            return { dispose: sinon.spy() };
        });

        const promise = updateKeploy.downloadAndInstallKeployBinary();

        assert.strictEqual(createTerminalStub.calledOnce, true);
        assert.strictEqual(createTerminalStub.firstCall.args[0].shellPath, 'wsl.exe');
        assert.strictEqual(createTerminalStub.firstCall.args[0].name, 'Keploy Terminal');
        assert.strictEqual(terminalMock.sendText.calledOnceWith(" curl --silent -O -L https://keploy.io/install.sh && source install.sh;exit 0"), true);
        assert.strictEqual(terminalMock.show.calledOnce, true);
        assert.strictEqual(showInformationMessageStub.calledOnceWith('Downloading and updating Keploy binary...'), true);

        if (terminalCloseListener) {
            terminalCloseListener(terminalMock);
        }
        await promise;
    });

    test('Download from docker should create a terminal and run the curl command on non-Windows platform', async () => {
        sinon.stub(process, 'platform').value('linux');

        let terminalCloseListener: Function | undefined;
        onDidCloseTerminalStub.callsFake((listener) => {
            terminalCloseListener = listener;
            return { dispose: sinon.spy() };
        });

        const promise = updateKeploy.downloadAndUpdateDocker();

        assert.strictEqual(createTerminalStub.calledOnce, true);
        assert.strictEqual(createTerminalStub.firstCall.args[0].shellPath, '/bin/bash');
        assert.strictEqual(terminalMock.sendText.calledOnceWith("docker pull ghcr.io/keploy/keploy:latest ; exit 0"), true);
        assert.strictEqual(terminalMock.show.calledOnce, true);
        assert.strictEqual(showInformationMessageStub.calledOnceWith('Downloading and updating Keploy binary...'), true);

        if (terminalCloseListener) {
            terminalCloseListener(terminalMock);
        }

        await promise;
    });

    test('Download from docker should create a terminal with WSL on Windows platform', async () => {
        sinon.stub(process, 'platform').value('win32');

        let terminalCloseListener: Function | undefined;
        onDidCloseTerminalStub.callsFake((listener) => {
            terminalCloseListener = listener;
            return { dispose: sinon.spy() };
        });

        const promise = updateKeploy.downloadAndUpdateDocker();

        assert.strictEqual(createTerminalStub.calledOnce, true);
        assert.strictEqual(createTerminalStub.firstCall.args[0].shellPath, 'wsl.exe');
        assert.strictEqual(createTerminalStub.firstCall.args[0].name, 'Keploy Terminal');
        assert.strictEqual(terminalMock.sendText.calledOnceWith("docker pull ghcr.io/keploy/keploy:latest ; exit 0"), true);
        assert.strictEqual(terminalMock.show.calledOnce, true);
        assert.strictEqual(showInformationMessageStub.calledOnceWith('Downloading and updating Keploy binary...'), true);

        if (terminalCloseListener) {
            terminalCloseListener(terminalMock);
        }
        await promise;
    });

    test("should not update if the version is already up to date", async () => {

        const getCurrentKeployVersionStub = sinon.stub(version,"getCurrentKeployVersion")
        const getKeployVersionStub = sinon.stub(version,"getKeployVersion")

        getCurrentKeployVersionStub.resolves("2.3.0-beta25")
        getKeployVersionStub.resolves("v2.3.0-beta25")
        
        await updateKeploy.downloadAndUpdate()
        
        assert.strictEqual(showInformationMessageStub.calledOnce,true)
    })
});