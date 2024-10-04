import * as sinon from 'sinon';
import * as child_process from 'child_process';
import assert from 'assert';
import executeKeployOneClickCommand from '../../OneClickInstall';
import { suite, test, setup, teardown } from 'mocha';

suite('executeKeployOneClickCommand', () => {
    let execStub: sinon.SinonStub;

    setup(() => {
        execStub = sinon.stub(require('child_process'), 'exec');
    });

    teardown(() => {
        sinon.restore();
    });

    test('should install Keploy if not already installed', () => {
        const checkKeployExistsCommand = `keploy`;
        const installationCommand = `curl --silent -L https://keploy.io/install.sh -o /tmp/install.sh && chmod +x /tmp/install.sh && /tmp/install.sh -noRoot`;

        // Simulate Keploy not being installed
        execStub.withArgs(checkKeployExistsCommand).callsArgWith(1, new Error('command not found'), '', '');

        executeKeployOneClickCommand();

        assert(execStub.calledWith(installationCommand));
    });

    test('should not install Keploy if already installed', () => {
        const checkKeployExistsCommand = `keploy`;

        execStub.withArgs(checkKeployExistsCommand).callsArgWith(1, null, 'Keploy version 1.0.0', '');

        executeKeployOneClickCommand();

        assert(execStub.calledWith(checkKeployExistsCommand));
        assert(execStub.calledOnce);
    });

});