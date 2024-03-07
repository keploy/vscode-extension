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
exports.default = getKeployVersion;
//# sourceMappingURL=version.js.map