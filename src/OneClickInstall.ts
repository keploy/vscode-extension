import { exec } from 'child_process';

export default function executeKeployOneClickCommand(): void {
    // Check if Keploy is installed by trying to run the `keploy` command
    const checkKeployExistsCommand = `keploy`;
    
    // The command to download and install Keploy
    const installationCommand = `curl --show-error -L https://keploy.io/install.sh -o /tmp/install.sh && chmod +x /tmp/install.sh && source /tmp/install.sh -noRoot`;

    exec(checkKeployExistsCommand, (error, stdout, stderr) => {
        if (error) {
            // Execute the installation command
            exec(installationCommand, (installError, installStdout, installStderr) => {
                if (installError) {
                    console.error(`Error during installation: ${installError.message}`);
                    return;
                }
            });
        } else {
            console.log(`Keploy is already installed: ${stdout}`);
        }
    });
}