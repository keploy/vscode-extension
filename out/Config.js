"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.handleInitializeKeployConfigFile = exports.handleOpenKeployConfigFile = void 0;
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
function handleOpenKeployConfigFile(webview) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
        const configFilePath = folderPath + '/keploy.yml';
        // Check if the file exists
        if (!(0, fs_1.existsSync)(configFilePath)) {
            webview.postMessage({ type: 'configNotFound', value: 'Config file not found in the current workspace.' });
            return;
        }
        // Read the config file content
        const configFileContent = (0, fs_1.readFileSync)(configFilePath, 'utf8');
        // Define the comment to check for
        const initComment = "# This config file has been initialized";
        // Check if the comment is present at the end of the file
        const isInitialized = configFileContent.trim().endsWith(initComment);
        if (!isInitialized) {
            webview.postMessage({ type: 'configUninitialized', value: 'Config file is not initialized. Please initialize the config file.' });
            return;
        }
        // Open the config file in the editor
        vscode.workspace.openTextDocument(configFilePath).then(doc => {
            vscode.window.showTextDocument(doc, { preview: false });
        });
    });
}
exports.handleOpenKeployConfigFile = handleOpenKeployConfigFile;
function handleInitializeKeployConfigFile(webview, path, command) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Initializing config file');
        const folderPath = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
        const configFilePath = folderPath + '/keploy.yml';
        // Initialize the config file with the provided path and command
        const initContent = `
path: "${path}"
appId: ""
command: "${command}"
port: 0
proxyPort: 16789
dnsPort: 26789
debug: false
disableANSI: false
disableTele: false
inDocker: false
generateGithubActions: true
containerName: ""
networkName: ""
buildDelay: 30
test:
  selectedTests: {}
  globalNoise:
    global: {}
    test-sets: {}
  delay: 5
  apiTimeout: 5
  coverage: false
  goCoverage: false
  coverageReportPath: ""
  ignoreOrdering: true
  mongoPassword: "default@123"
  language: ""
  removeUnusedMocks: false
record:
  recordTimer: 0s
  filters: []
configPath: ""
bypassRules: []
cmdType: "native"
enableTesting: false
fallbackOnMiss: false
keployContainer: "keploy-v2"
keployNetwork: "keploy-network"

# This config file has been initialized
  `;
        // Write the content to the config file
        yield vscode.workspace.fs.writeFile(vscode.Uri.file(configFilePath), Buffer.from(initContent));
        // Open the config file in the editor
        vscode.workspace.openTextDocument(configFilePath).then(doc => {
            vscode.window.showTextDocument(doc, { preview: false });
        });
    });
}
exports.handleInitializeKeployConfigFile = handleInitializeKeployConfigFile;
//# sourceMappingURL=Config.js.map