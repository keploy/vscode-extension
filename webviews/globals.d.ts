import * as vscode from "vscode"

declare global {
    const vscode: {
      postMessage: ({ type: string, value: any , command : string , path : string}) => void;
    };
}