import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
    // Create the Mocha test instance
    const mocha = new Mocha({
        ui: 'bdd',
        color: true,
    });

    const testsRoot = path.resolve(__dirname, './suites');

    // Use glob.sync to get test files
    const files = glob.sync('**/**.test.js', { cwd: testsRoot });

    // Check if any test files were found
    if (files.length === 0) {
        console.warn('No test files found.');
        return; // No need to resolve or reject, just exit
    }

    // Add files to the test suite
    files.forEach((file: string) => mocha.addFile(path.resolve(testsRoot, file)));

    try {
        // Run the mocha tests
        const failures = await new Promise<number>((resolve, reject) => {
            mocha.run((failures: number) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve(failures);
                }
            });
        });

        if (failures > 0) {
            throw new Error(`${failures} tests failed.`);
        }
    } catch (error) {
        throw error; // Propagate the error if any
    }
}
