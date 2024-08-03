import * as vscode from 'vscode';
import * as http from 'http';
import { v4 as uuidv4 } from 'uuid';

export default async function SignIn() {
    const state = uuidv4(); // Generate a unique state parameter for security
    const redirectUri = `http://localhost:3000/callback`; // Change the port if needed
    const authUrl = `https://app.keploy.io/signin?extension=true&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    // Open the authentication URL in the default web browser
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    // Create a local server to handle the callback
    const server = http.createServer((req  :any, res : any) => {
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
                    return data
                }).catch((error) => {
                    console.error('Failed to fetch access token:', error);
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>State mismatch. Authentication failed.</h1>');
            }

            server.close();
        }
    }).listen(3000); // Change the port if needed
}

async function fetchAccessToken(code: string | null) {
    // Exchange the authorization code for an access token
    const response = await fetch('https://app.keploy.io/token', {
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
}

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
        })

        if (response.status == 200) {
            return response.json()
        } else {
            return response.json()
        }
    } catch (err) {
        console.log("ERROR at login", err)
    }
}