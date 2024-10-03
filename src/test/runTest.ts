import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    process.env.NODE_PATH = path.join(extensionDevelopmentPath, 'instrumented');

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: path.resolve(__dirname, './mochaRunner'),
    });

  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
