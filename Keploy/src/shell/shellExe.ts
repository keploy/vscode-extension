import {exec} from 'child_process';
import * as os from 'os';

export const shellExecutor = (cmd: string) => {
    return new Promise<string>((resolve, reject) => {
        let command: string;
        if (os.platform() === 'win32') {          
            command = `wsl ${cmd}`;
        } else {            
            command = cmd;
        }
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err.message);
                return;
            }
            if (stderr) {
                console.log(stderr); 
            }
            resolve(stdout);
        });
        
    });
};