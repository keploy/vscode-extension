
import { execShell } from './execShell';
import { Sentry } from './sentryInit';
export async function getKeployVersion() {
    // GitHub repository details
    const repoOwner = "keploy";
    const repoName = "keploy";

    const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

    // Get the latest release
    const response = await fetch(apiURL);
    const data: any = await response.json();
    const latestVersion = data.tag_name;
    return latestVersion;
}

export async function getCurrentKeployVersion() {
    let output = '';
    try{
        output = await execShell('keploy  --version');
    }catch(error){
        console.log("Error Fetching version with Alias " + error);
        try{
            output = await execShell('/usr/local/bin/keploybin --version');
        }catch(error){
            console.log("Error Fetching version With Absolute path " + error);
            Sentry?.captureException(error);
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
}