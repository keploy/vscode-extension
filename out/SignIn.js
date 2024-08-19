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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFirst = exports.getInstallationID = exports.loginAPI = exports.getMicrosoftAccessToken = exports.getGitHubAccessToken = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
const uuid_1 = require("uuid");
const os = require('os');
const { execSync } = require('child_process');
const axios_1 = __importDefault(require("axios"));
// export default async function SignIn() {
//     const state = uuidv4(); // Generate a unique state parameter for security
//     const redirectUri = `http://localhost:3000/callback`; // Change the port if needed
//     const scope = 'email profile';
//     const clientId = '232480566976-bb1gesn9r5e1240ojemiqjas80h63e31.apps.googleusercontent.com';
//     const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
//     // Open the authentication URL in the default web browser
//     vscode.env.openExternal(vscode.Uri.parse(authUrl));
//     console.log("Opening the browser");
//     // Create a local server to handle the callback
//     const server = http.createServer((req: any, res: any) => {
//         if (req.url.startsWith('/callback')) {
//             const url = new URL(req.url, `http://${req.headers.host}`);
//             const receivedState = url.searchParams.get('state');
//             const code = url.searchParams.get('code');
//             console.log("Received code", code);
//             if (receivedState === state) {
//                 // Redirect to the backend server for token exchange
//                 const backendUrl = `https://api.keploy.io/auth/login?code=${code}&state=${state}`;
//                 vscode.env.openExternal(vscode.Uri.parse(backendUrl));
//                 res.writeHead(200, { 'Content-Type': 'text/html' });
//                 res.end('<h1>Authentication in progress. Please return to the VS Code extension.</h1>');
//             } else {
//                 res.writeHead(400, { 'Content-Type': 'text/html' });
//                 res.end('<h1>State mismatch. Authentication failed.</h1>');
//             }
//             server.close();
//         }
//     }).listen(3000); // Change the port if needed
// }
function fetchGitHubEmail(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });
            if (!response.ok) {
                throw new Error(`GitHub API responded with status ${response.status}`);
            }
            const emails = yield response.json();
            const primaryEmail = emails.find((email) => email.primary && email.verified);
            return primaryEmail ? primaryEmail.email : null;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch email: ${error}`);
            return null;
        }
    });
}
function getGitHubAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield vscode.authentication.getSession('github', ['repo', 'user:email'], { createIfNone: true });
            if (session) {
                const accessToken = session.accessToken;
                console.log('Access Token:', accessToken);
                // Fetch the user's email
                const email = yield fetchGitHubEmail(accessToken);
                console.log('Email:', email);
                return { accessToken, email };
            }
            else {
                vscode.window.showErrorMessage('Failed to get GitHub session.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });
}
exports.getGitHubAccessToken = getGitHubAccessToken;
function getMicrosoftAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield vscode.authentication.getSession('microsoft', ['user.read'], { createIfNone: true });
            if (session) {
                const accessToken = session.accessToken;
                console.log('Access Token:', accessToken);
                return { accessToken };
            }
            else {
                vscode.window.showErrorMessage('Failed to get Microsoft session.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });
}
exports.getMicrosoftAccessToken = getMicrosoftAccessToken;
function SignInWithGitHub() {
    return __awaiter(this, void 0, void 0, function* () {
        const state = (0, uuid_1.v4)(); // Generate a unique state parameter for security
        const redirectUri = `http://localhost:3000/login/github/callback`; // Change the port if needed
        const clientId = 'Ov23liNPnpLFCh1lYJkB';
        const scope = 'user:email';
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        // Open the authentication URL in the default web browser
        vscode.env.openExternal(vscode.Uri.parse(authUrl));
        // Create a local server to handle the callback
        const server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.url.startsWith('/login/github/callback')) {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const receivedState = url.searchParams.get('state');
                const code = url.searchParams.get('code');
                console.log("Received code", code);
                if (receivedState === state) {
                    // Make a POST request to the backend server to exchange the code for an access token
                    const backendUrl = `http://localhost:8083/auth/login`;
                    // vscode.env.openExternal(vscode.Uri.parse(backendUrl));
                    try {
                        // Await the response from the backend
                        const response = yield loginAPI(backendUrl, 'github', code === null || code === void 0 ? void 0 : code.toString());
                        if (response.error) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: response.error }));
                        }
                        else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            const resp = JSON.stringify(response);
                            res.end(resp); // Send the JSON response back
                        }
                    }
                    catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    }
                }
                else {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>State mismatch. Authentication failed.</h1>');
                }
                server.close();
            }
        })).listen(3000); // Change the port if needed
    });
}
exports.default = SignInWithGitHub;
// async function fetchAccessToken(code: string | null) {
//     // Exchange the authorization code for an access token
//     const response = await fetch('https://app.keploy.io/token', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ code })
//     });
//     // Dummy data for demonstration
//     const data = {
//         accessToken: "1234567890"
//     };
//     return data;
// }
function loginAPI(url = "", provider = "", code = "") {
    return __awaiter(this, void 0, void 0, function* () {
        // Default options are marked with *
        // var response : Response
        try {
            const response = yield fetch(url, {
                method: "POST",
                // mode: 'no-cors', // no-cors, *cors, same-origin
                // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'omit', // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json"
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify({ provider: provider, code: code }) // body data type must match "Content-Type" header
            });
            if (response.status === 200) {
                return response.json();
            }
            else {
                return response.json();
            }
        }
        catch (err) {
            console.log("ERROR at login", err);
        }
    });
}
exports.loginAPI = loginAPI;
function getInstallationID() {
    return __awaiter(this, void 0, void 0, function* () {
        let id;
        try {
            const inDocker = process.env.IN_DOCKER === 'true';
            if (inDocker) {
                id = process.env.INSTALLATION_ID;
            }
            else {
                // Run the macOS specific command to get the IOPlatformUUID
                const output = execSync('ioreg -rd1 -c IOPlatformExpertDevice').toString();
                id = extractID(output);
            }
            if (!id) {
                console.error("Got empty machine id");
                throw new Error("Empty machine id");
            }
            console.log("Installation ID:", id);
            return id;
        }
        catch (err) {
            console.error("Failed to get installation ID:", err);
            throw new Error("Failed to get installation ID");
        }
    });
}
exports.getInstallationID = getInstallationID;
function extractID(output) {
    const lines = output.split('\n');
    for (let line of lines) {
        if (line.includes('IOPlatformUUID')) {
            const parts = line.split('" = "');
            if (parts.length === 2) {
                return parts[1].trim().replace('"', '');
            }
        }
    }
    throw new Error("Failed to extract 'IOPlatformUUID' value from `ioreg` output.");
}
function validateFirst(token, serverURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${serverURL}/auth/github`;
        getInstallationID();
        const requestBody = {
            GitHubToken: "",
            InstallationID: "",
        };
        console.log("requestBody.GitHubToken:", requestBody.GitHubToken, "requestBody.InstallationID:", requestBody.InstallationID);
        try {
            const response = yield axios_1.default.post(url, requestBody, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status !== 200) {
                throw new Error(`Failed to authenticate: ${response.data.Error}`);
            }
            const jwtToken = response.data.JwtToken;
            console.log("THEN JWT TOKEN", jwtToken);
            return {
                emailID: response.data.EmailID,
                isValid: response.data.IsValid,
                error: response.data.Error,
            };
        }
        catch (err) {
            console.error("Failed to authenticate:", err.message);
            throw new Error(`Failed to authenticate: ${err.message}`);
        }
    });
}
exports.validateFirst = validateFirst;
//# sourceMappingURL=SignIn.js.map