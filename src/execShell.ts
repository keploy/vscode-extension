import {exec} from 'child_process';
import * as os from 'os';

export const execShell = (cmd: string) => {
    return new Promise<string>((resolve, reject) => {
        let commandToExecute: string;
        if (os.platform() === 'win32') {
            // Execute the command in the WSL environment if on Windows
            commandToExecute = `wsl ${cmd}`;
        } else {
            // Execute the command in the default shell if on other platforms
            commandToExecute = cmd;
        }
        exec(commandToExecute, (err, stdout, stderr) => {
            if (err) {
                reject(err.message);
                return;
            }
            if (stderr) {
                console.log(stderr); // Log stderr but don't reject the promise
            }
            resolve(stdout);
        });
        
    });
};