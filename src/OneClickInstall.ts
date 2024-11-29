import { exec } from 'child_process';
import { getKeployVersion , getCurrentKeployVersion } from './version';

export default async function executeKeployOneClickCommand(): Promise<void> {
    // Check if Keploy is installed by trying to run the `keploy` command
    const checkKeployExistsCommand = `keploy`;
    const keployVersion = await getKeployVersion();
    const currentKeployVersion = await getCurrentKeployVersion();

    // Check the if keploy is installed and have the same version or not
    if(currentKeployVersion !== "" && keployVersion !== currentKeployVersion){
        const removeKeployCommand = `rm -rf ~/.keploy`;
        exec(removeKeployCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error during removal: ${error.message}`);
                return;
            }
        });
    }
    
    // The command to download and install Keploy
    const installationCommand = `curl --silent -L https://keploy.io/install.sh -o /tmp/install.sh && chmod +x /tmp/install.sh && /tmp/install.sh -v ${keployVersion} -noRoot`;

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
