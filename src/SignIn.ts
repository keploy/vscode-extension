import * as vscode from 'vscode';
import * as http from 'http';
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid';
const os = require('os');
const { execSync } = require('child_process');
import axios, { AxiosResponse } from 'axios';


async function fetchGitHubEmail(accessToken: string): Promise<string | null> {
    try {
        const response = await fetch('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API responded with status ${response.status}`);
        }

        const emails = await response.json();
        const primaryEmail = emails.find((email: any) => email.primary && email.verified);

        return primaryEmail ? primaryEmail.email : null;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to fetch email: ${error}`);
        return null;
    }
}

export async function getGitHubAccessToken() {
    try {
        const session = await vscode.authentication.getSession('github', ['user:email'], { createIfNone: true });
        if (session) {
            const accessToken = session.accessToken;
            console.log('Access Token:', accessToken);

            // Fetch the user's email
            const email = await fetchGitHubEmail(accessToken);
            console.log('Email:', email);

            return { accessToken, email };
        } else {
            vscode.window.showErrorMessage('Failed to get GitHub session.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}

export async function getMicrosoftAccessToken() {
    try {
        const session = await vscode.authentication.getSession('microsoft', ['user.read'], { createIfNone: true });
        if (session) {
            const accessToken = session.accessToken;
            console.log('Access Token:', accessToken);

            return { accessToken };
        } else {
            vscode.window.showErrorMessage('Failed to get Microsoft session.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}

function generateRandomState() {
    return [...Array(30)].map(() => Math.random().toString(36)[2]).join('');
}



export default async function SignInWithGitHub() {
    const state = uuidv4(); // Generate a unique state parameter for security
    const redirectUri = `https://app.keploy.io/login/github/callback`; // Change the port if needed
    const clientId = 'Ov23liNPnpLFCh1lYJkB';
    const scope = 'user:email';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    // Open the authentication URL in the default web browser
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    // Create a local server to handle the callback
    const server = http.createServer(async (req: any, res: any) => {
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
                    const response = await loginAPI(backendUrl, 'github', code?.toString());

                    if (response.error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: response.error }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        const resp = JSON.stringify(response);
                        res.end(resp);  // Send the JSON response back
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>State mismatch. Authentication failed.</h1>');
            }
            server.close();
        }   
    }).listen(3000); // Change the port if needed
}


export async function SignInWithOthers() {
    const state = generateRandomState();  // Generate a secure random state
    const authUrl = `https://app.keploy.io/signin?vscode=true&state=${state}`;
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            if (req && req.url && req.url.startsWith('/login/keploy/callback')) {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const receivedState = url.searchParams.get('state');
                const token = url.searchParams.get('token');
                console.log("Received state:", receivedState);
              
                if (!receivedState || !token) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing state or token' }));
                    reject(new Error('Missing state or token'));
                    server.close();
                    return;
                }

                try {
                    // Simulate processing the token
                    console.log("Processing token...");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Token received and processed', token, receivedState }));

                    // Resolve the promise with the token
                    resolve(token.toString());
                } catch (err) {
                    console.error('Error processing token:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    reject(err);
                } finally {
                    server.close();  // Close the server once the request is handled
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        }).listen(3001, () => {
            console.log('Server listening on port 3001');
        });
    });
}
 

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

export async function loginAPI(url = "", provider = "", code = "") {
    // Default options are marked with *
    // var response : Response
    try {
        const response = await fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            // mode: 'no-cors', // no-cors, *cors, same-origin
            // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            // credentials: 'omit', // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json"
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({ provider: provider, code: code }) // body data type must match "Content-Type" header
        });

        if (response.status === 200) {

            return response.json();
        } else {
            return response.json();
        }
    } catch (err) {
        console.log("ERROR at login", err);
    }
}


export async function getInstallationID(): Promise<string> {
    let id;

    const dbusPath = "/var/lib/dbus/machine-id";
    // dbusPathEtc is the default path for dbus machine id located in /etc.
	// Some systems (like Fedora 20) only know this path.
	// Sometimes it's the other way round.
    const dbusPathEtc = "/etc/machine-id";

    // Reads the content of a file and returns it as a string.
    // If the file cannot be read, it throws an error.
    function readFile(filePath: string): string {
        try {
            return fs.readFileSync(filePath, 'utf-8').trim();
        } catch (err) {
            throw new Error(`Error reading file ${filePath}: ${err}`);
        }
    }

    function machineID(): string {
        let id = "";
        try {
            id = readFile(dbusPath);
        } catch (err) {
            // Try the fallback path
            try {
                id = readFile(dbusPathEtc);
            } catch (err) {
                console.error("Failed to read machine ID from both paths:", err);
                throw new Error("Failed to get machine ID");
            }
        }
        return id;
    }
    try {
        const inDocker = process.env.IN_DOCKER === 'true';

        if (inDocker) {
            id = process.env.INSTALLATION_ID;
        } else {
            const platform = os.platform();
            if (platform === 'darwin') {
                // macOS specific command to get the IOPlatformUUID
                const output = execSync('ioreg -rd1 -c IOPlatformExpertDevice').toString();
                id = extractID(output);
            } else if (platform === 'linux') {
                // Use the new machineID function for Linux
                id = machineID();
            } else {
                throw new Error(`Unsupported platform: ${platform}`);
            }
        }
        if (!id) {
            console.error("Got empty machine id");
            throw new Error("Empty machine id");
        }
        console.log("Installation ID:", id);
        return id;
    } catch (err) {
        console.error("Failed to get installation ID:", err);
        throw new Error("Failed to get installation ID");
    }
}

function extractID(output: any) {
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



interface AuthReq {
    GitHubToken: string;
    InstallationID: string;
}

interface AuthResp {
    EmailID: string;
    IsValid: boolean;
    jwtToken: string;
    Error: string;
}


export async function validateFirst(token: string, serverURL: string): Promise<{ emailID: string; isValid: boolean; error: string , JwtToken:string }> {
    const url = `${serverURL}/auth/github`;

    const installationID = await getInstallationID();
    // extract string from promise
    const requestBody: AuthReq = {
        GitHubToken: token,
        InstallationID: installationID,
    };
    console.log("Request Body:", requestBody);
    try {
        const response: AxiosResponse<AuthResp> = await axios.post<AuthResp>(url, requestBody, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
            throw new Error(`Failed to authenticate: ${response.data.Error}`);
        }
        
        return {
            emailID: response.data.EmailID,
            isValid: response.data.IsValid,
            error: response.data.Error,
            JwtToken: response.data.jwtToken,
        };
    } catch (err: any) {
        console.error("Failed to authenticate:", err.message);
        throw new Error(`Failed to authenticate: ${err.message}`);
    }
}