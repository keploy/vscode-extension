import assert from "assert";
import { suite , setup , test , teardown } from "mocha";
import sinon from "sinon";
import { getCurrentKeployVersion, getKeployVersion } from "../../version";
import * as exec from "../../execShell";

suite("Version tests", () => {

    let fetchStub : sinon.SinonStub

    setup(() => {
        fetchStub = sinon.stub(global,"fetch")
    })

    teardown(() => {
        sinon.restore()
    })

    // test("getKeployVersion should be calling correct api", async () => {
    //     let api = "https://api.github.com/repos/keploy/keploy/releases/latest"
    //     const mockResponse = {tag_name : "v2.3.0-beta25"};
    //     fetchStub.resolves(new Response(JSON.stringify(mockResponse), { status: 200 }))

    //     await getKeployVersion();

    //     assert(fetchStub.calledOnce)
    //     assert(fetchStub.calledWith(api))
    // })

    test("getCurrentKeployVersion should return version by executing keploy command", async () => {
        
        const execShellStub = sinon.stub(exec,"execShell")
        const cmd = 'keploy  --version'
        const version = "2.3.0-beta25"

        execShellStub.resolves("Keploy 2.3.0-beta25")

        const result = await getCurrentKeployVersion();

        assert(execShellStub.calledOnce)
        assert(execShellStub.calledWith(cmd))
        assert.strictEqual(result,version)
    })
})