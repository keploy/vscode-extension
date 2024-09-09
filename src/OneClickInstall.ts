import { exec } from 'child_process';
import { SentryInstance } from './sentryInit';

export default function executeKeployOneClickCommand(): void {
    // check before if keploy has been installed first
    const checkKeployExistsCommand = `keploy`;
    const installationCommand = `curl --silent -O -L https://keploy.io/install.sh && bash install.sh`;

    exec(checkKeployExistsCommand, (error, stdout, stderr) => {
        if (error) {
            exec(installationCommand, (error, stdout, stderr) => {
                if (error) {
                    SentryInstance?.captureException(error);
                    console.error(`Error executing command: ${error.message}`);
                    return;
                }

                if (stderr) {
                    SentryInstance?.captureException(new Error(stderr));
                    console.error(`Command execution returned an error: ${stderr}`);
                    return;
                }

                console.log(`Command executed successfully: ${stdout}`);
            });
        }
    });
}
