import { exec } from "child_process";
import * as os from "os";
import * as vscode from "vscode";

export default function executeKeployOneClickCommand(): void {
	const platform = os.platform();
	let command: string;

	if (platform === "win32") {
		// for future use
		command = `powershell -Command "iwr https://raw.githubusercontent.com/keploy/keploy/main/windows-install.ps1 -useb | iex"`;
	} else if (platform === "darwin" || platform === "linux") {
		command = `curl --silent -O -L https://keploy.io/install.sh && source install.sh`;
	} else {
		vscode.window.showErrorMessage(`Unsupported platform: ${platform}`);
		return;
	}

	const terminal = vscode.window.createTerminal("Keploy Installation");
	terminal.show();
	terminal.sendText(command);

	terminal.sendText("keploy --version");

	// Check if Go is installed
	// checkGoInstallation(terminal);
}

// // not needed if someone working with go project will have go installed already on their system
// function checkGoInstallation(terminal: vscode.Terminal): void {
//     exec('go version', (error, stdout, stderr) => {
//         if (error) {
//             vscode.window.showWarningMessage('Go is not installed. Installing Go is recommended for using Keploy with Go projects.');
//             const installGoCommand = getGoInstallCommand();
//             if (installGoCommand) {
//                 vscode.window.showInformationMessage('Would you like to install Go?', 'Yes', 'No')
//                     .then(selection => {
//                         if (selection === 'Yes') {
//                             terminal.sendText(installGoCommand);
//                         }
//                     });
//             }
//         } else {
//             vscode.window.showInformationMessage(`Go is installed: ${stdout.trim()}`);
//         }
//     });
// }

// function getGoInstallCommand(): string | null {
//     const platform = os.platform();
//     switch (platform) {
//         case 'darwin':
//             return 'brew install go';
//         case 'linux':
//             return 'sudo apt-get update && sudo apt-get install golang-go';
//         case 'win32':
//             return 'choco install golang';
//         default:
//             vscode.window.showErrorMessage(`Unsupported platform for Go installation: ${platform}`);
//             return null;
//     }
// }
