import { execShell } from "../../execShell";
import assert from "assert";
import { suite , setup , test , teardown } from "mocha";
import sinon from "sinon";

suite("execShell Test", () => {

    let execStub: sinon.SinonStub;
    let platformStub: sinon.SinonStub;

    setup(() => {
        execStub = sinon.stub(require("child_process"), "exec");
        platformStub = sinon.stub(require("os"), "platform");
    });

    teardown(() => {
        sinon.restore();
    });

    test("should execute the command in the default shell if on other platforms", async () => {
        platformStub.returns("linux");
        const cmd = "echo hello";

        execStub.yields(null, "hello", "");

        await execShell(cmd);

        assert(execStub.calledWith(cmd));
    })

    test("should execute the command with wsl if running on wsl", async () => {
        platformStub.returns("win32");
        const cmd = "echo hello";

        execStub.yields(null, "hello", "");

        await execShell(cmd);

        assert(execStub.calledWith(`wsl ${cmd}`));
    })
});
