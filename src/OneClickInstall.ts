import { exec } from 'child_process';

export default function executeKeployOneClickCommand(): void {
    const command = 'curl --silent -O -L https://keploy.io/install.sh && bash install.sh';

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
