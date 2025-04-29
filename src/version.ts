
import { execShell } from './execShell';
import * as path from 'path';
import * as fs from 'fs';
export async function getKeployVersion() {
    const packagePath = path.resolve(__dirname, '../package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    const packageData = JSON.parse(packageContent);

    const keployVersionJsonPath = path.resolve(__dirname, '../keploy-version.json');
    const keployVersionJsonContent = fs.readFileSync(keployVersionJsonPath, 'utf-8');
    const keployVersionJson = JSON.parse(keployVersionJsonContent);

    const keployVersion = keployVersionJson[`${packageData.version}`];

    return keployVersion;
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
            return '';
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