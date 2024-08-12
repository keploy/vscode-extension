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
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function Utg(context) {
    // Your command logic here
    const editor = vscode.window.activeTextEditor;
    let currentFilePath = "";
    if (editor) {
        const document = editor.document;
        currentFilePath = document.uri.fsPath;
        vscode.window.showInformationMessage(`Current opened file: ${currentFilePath}`);
        // Add your additional logic here
    }
    else {
        vscode.window.showInformationMessage('No file is currently opened.');
    }
    const scriptPath = path.join(context.extensionPath, 'scripts', 'utg.sh');
    // Create a terminal named "Keploy Terminal"
    const terminal = vscode.window.createTerminal("Keploy Terminal");
    const sourceFilePath = currentFilePath;
    ensureTestFileExists(sourceFilePath);
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('No workspace is opened.');
        return;
    }
    const rootDir = path.dirname(vscode.workspace.workspaceFolders[0].uri.fsPath); // Root directory of the project
    const testDir = path.join(rootDir, 'test');
    const testFilePath = path.join(testDir, path.basename(sourceFilePath).replace('.js', '.test.js'));
    if (!fs.existsSync(testFilePath)) {
        vscode.window.showInformationMessage("Test doesn't exists", testFilePath);
        fs.writeFileSync(testFilePath, `// Test file for ${testFilePath}`);
    }
    vscode.window.showInformationMessage("testFilePath", testFilePath);
    const coverageReportPath = "./coverage/cobertura-coverage.xml";
    // Send the command to the terminal
    terminal.sendText(`sh "${scriptPath}" "${sourceFilePath}" "${testFilePath}" "${coverageReportPath}"`);
    terminal.show();
    context.subscriptions.push(terminal); // Ensure the terminal is disposed when the extension is deactivated
}
function ensureTestFileExists(sourceFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace is opened.');
            return;
        }
        const rootDir = path.dirname(vscode.workspace.workspaceFolders[0].uri.fsPath); // Root directory of the project
        const testDir = path.join(rootDir, 'test');
        const relativeSourceFilePath = path.relative(rootDir, sourceFilePath);
        const sourceFileName = path.basename(sourceFilePath);
        const testFileName = sourceFileName.replace('.js', '.test.js');
        const testFilePath = path.join(testDir, relativeSourceFilePath.replace(sourceFileName, testFileName));
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        const testFileDir = path.dirname(testFilePath);
        if (!fs.existsSync(testFileDir)) {
            fs.mkdirSync(testFileDir, { recursive: true });
        }
        if (!fs.existsSync(testFilePath)) {
            fs.writeFileSync(testFilePath, `// Test file for ${sourceFileName}`);
            vscode.window.showInformationMessage(`Created test file: ${testFilePath}`);
        }
        else {
            vscode.window.showInformationMessage(`Test file already exists: ${testFilePath}`);
        }
    });
}
exports.default = Utg;
//# sourceMappingURL=Utg.js.map