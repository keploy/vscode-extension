"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentKeployVersion = exports.getKeployVersion = void 0;
const execShell_1 = require("./execShell");
function getKeployVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        // GitHub repository details
        const repoOwner = "keploy";
        const repoName = "keploy";
        const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;
        // Get the latest release
        const response = yield fetch(apiURL);
        const data = yield response.json();
        const latestVersion = data.tag_name;
        return latestVersion;
    });
}
exports.getKeployVersion = getKeployVersion;
function getCurrentKeployVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        let output = '';
        try {
            output = yield (0, execShell_1.execShell)('keploy  --version');
        }
        catch (error) {
            console.log("Error Fetching version with Alias " + error);
            try {
                output = yield (0, execShell_1.execShell)('/usr/local/bin/keploybin --version');
            }
            catch (error) {
                console.log("Error Fetching version With Absolute path " + error);
                throw error;
            }
        }
        console.log('output:', output);
        const keployIndex = output.indexOf('Keploy');
        console.log('keployIndex:', keployIndex);
        let keployVersion = '';
        if (keployIndex !== -1) {
            keployVersion = output.substring(keployIndex + 'Keploy'.length).trim();
        }
        console.log('Current Keploy version:', keployVersion);
        return keployVersion;
    });
}
exports.getCurrentKeployVersion = getCurrentKeployVersion;
//# sourceMappingURL=version.js.map