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
exports.loginAPI = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
const uuid_1 = require("uuid");
function SignIn() {
    return __awaiter(this, void 0, void 0, function* () {
        const state = (0, uuid_1.v4)(); // Generate a unique state parameter for security
        const redirectUri = `http://localhost:3000/callback`; // Change the port if needed
        const authUrl = `https://app.keploy.io/signin?extension=true&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        // Open the authentication URL in the default web browser
        vscode.env.openExternal(vscode.Uri.parse(authUrl));
        // Create a local server to handle the callback
        const server = http.createServer((req, res) => {
            if (req.url.startsWith('/callback')) {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const receivedState = url.searchParams.get('state');
                const code = url.searchParams.get('code');
                if (receivedState === state) {
                    // Here you would exchange the code for an access token
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<h1>Authentication successful! You can close this window.</h1>');
                    // Exchange the code for an access token
                    fetchAccessToken(code).then((data) => {
                        console.log("API CALL WAS MADE WITH DUMMY DATA");
                        return data;
                    }).catch((error) => {
                        console.error('Failed to fetch access token:', error);
                    });
                }
                else {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>State mismatch. Authentication failed.</h1>');
                }
                server.close();
            }
        }).listen(3000); // Change the port if needed
    });
}
exports.default = SignIn;
function fetchAccessToken(code) {
    return __awaiter(this, void 0, void 0, function* () {
        // Exchange the authorization code for an access token
        const response = yield fetch('https://app.keploy.io/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });
        // Dummy data for demonstration
        const data = {
            accessToken: "1234567890"
        };
        return data;
    });
}
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
            if (response.status == 200) {
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
//# sourceMappingURL=SignIn.js.map