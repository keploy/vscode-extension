import { exec } from 'child_process';

export default function executeKeployOneClickCommand(): void {
    // Check if Keploy is installed by trying to run the `keploy` command
    const checkKeployExistsCommand = `keploy`;
    
    // The command to download and install Keploy
    const installationCommand = `curl --show-error -L https://keploy.io/install.sh -o /tmp/install.sh && chmod +x /tmp/install.sh && source /tmp/install.sh -noRoot`;

    exec(checkKeployExistsCommand, (error, stdout, stderr) => {
        if (error) {
            console.log("Keploy is not installed. Installing...");

            // Execute the installation command
            exec(installationCommand, (installError, installStdout, installStderr) => {
                if (installError) {
                    console.error(`Error during installation: ${installError.message}`);
                    return;
                }
                setTimeout(()=>{2000})

                // if (installStderr) {
                //     console.error(`Installation process returned an error: ${installStderr}`);
                //     return;
                // }

                // console.log(`Installation output: ${installStdout}`);
            });
        } else {
            console.log(`Keploy is already installed: ${stdout}`);
        }
    });
}

// curl --silent -L https://keploy.io/install.sh -o /tmp/install.sh && sh/tmp/install.sh -noRoot

// /Users/yashkhare/Documents/keploy/samples-typescript/express-mongoose