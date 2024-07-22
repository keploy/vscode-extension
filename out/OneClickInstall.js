"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function executeKeployOneClickCommand() {
    const command = 'curl --silent -O -L https://keploy.io/install.sh && bash install.sh';
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Command execution returned an error: ${stderr}`);
            return;
        }
        console.log(`Command executed successfully: ${stdout}`);
    });
}
exports.default = executeKeployOneClickCommand;
//# sourceMappingURL=OneClickInstall.js.map