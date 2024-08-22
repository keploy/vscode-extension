import { exec } from 'child_process';

export default function executeKeployOneClickCommand(): void {
    const command = `
        curl --silent --location "https://github.com/keploy/keploy/releases/latest/download/keploy_darwin_all.tar.gz" | tar xz -C /tmp && 
        sudo mkdir -p /usr/local/bin && 
        sudo mv /tmp/keploy /usr/local/bin/keploy
    `;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Command execution returned an error: ${stderr}`);
            return;
        }

        console.log(`Command executed successfully: ${stdout}`);
    });
}
