import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FolderTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly fullPath: string,
        public readonly itemType: 'folder' | 'file' | 'class' | 'function',
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = itemType === 'function' ? 'Click to play this function' : this.fullPath;

        // Set icon based on itemType
        if (itemType === 'folder') {
            this.iconPath = collapsibleState === vscode.TreeItemCollapsibleState.Collapsed
                ? new vscode.ThemeIcon('folder')
                : new vscode.ThemeIcon('folder-opened');
        } else if (itemType === 'file') {
            this.iconPath = new vscode.ThemeIcon('file');
        } else if (itemType === 'class') {
            this.iconPath = new vscode.ThemeIcon('symbol-class');
        } else if (itemType === 'function') {
            this.iconPath = new vscode.ThemeIcon('symbol-function');
            this.contextValue = 'functionItem'; // Add context value for functions
        }

        // // Add the play button to the rightmost corner for function items
        // if (itemType === 'function') {
        //     const playIcon = '▶'; // You can replace this with any icon or SVG
        //     this.label = `${label} ${playIcon}`;
        // }

        console.log(`Created FolderTreeItem: label=${label}, fullPath=${fullPath}, itemType=${itemType}`);
    }
}

export class FolderTreeProvider implements vscode.TreeDataProvider<FolderTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FolderTreeItem | undefined | null | void> = new vscode.EventEmitter<FolderTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FolderTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
        console.log('Tree refreshed');
    }

    private containsJsOrTsFiles(dirPath: string): boolean {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const isDirectory = fs.statSync(fullPath).isDirectory();

            if (!isDirectory && (item.endsWith('.js') || item.endsWith('.ts'))) {
                return true;
            }
            if (isDirectory && this.containsJsOrTsFiles(fullPath)) {
                return true;
            }
        }
        return false;
    }

    private extractFunctionsFromFile(filePath: string): FolderTreeItem[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        const functionRegex = /function\s+(\w+)\s*\(/g;
        const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(/g;
        const classRegex = /class\s+(\w+)\s+/g;

        const items: FolderTreeItem[] = [];
        let match;

        // Extract functions
        while ((match = functionRegex.exec(content)) !== null) {
            items.push(
                new FolderTreeItem(
                    match[1],
                    vscode.TreeItemCollapsibleState.None,
                    filePath,
                    'function',
                )
            );
        }

        // Extract arrow functions
        while ((match = arrowFunctionRegex.exec(content)) !== null) {
            items.push(
                new FolderTreeItem(
                    match[1],
                    vscode.TreeItemCollapsibleState.None,
                    filePath,
                    'function',
                )
            );
        }

        // Extract classes
        while ((match = classRegex.exec(content)) !== null) {
            items.push(
                new FolderTreeItem(
                    match[1],
                    vscode.TreeItemCollapsibleState.None,
                    filePath,
                    'class',
                )
            );
        }

        console.log(`Extracted items from ${filePath}: ${items.map(item => item.label).join(', ')}`);
        return items;
    }

    private getChildrenOfDirectory(dirPath: string): FolderTreeItem[] {
        const items = fs.readdirSync(dirPath);
        return items
            .filter(itemName => itemName !== 'node_modules') // Exclude node_modules
            .filter(itemName => {
                const fullPath = path.join(dirPath, itemName);
                const isDirectory = fs.statSync(fullPath).isDirectory();
                return isDirectory
                    ? this.containsJsOrTsFiles(fullPath)
                    : itemName.endsWith('.js') || itemName.endsWith('.ts');
            })
            .map(itemName => {
                const fullPath = path.join(dirPath, itemName);
                const isDirectory = fs.statSync(fullPath).isDirectory();

                return new FolderTreeItem(
                    itemName,
                    isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Collapsed,
                    fullPath,
                    isDirectory ? 'folder' : 'file',
                    isDirectory
                        ? undefined
                        : {
                            command: 'vscode.open',
                            title: 'Open File',
                            arguments: [vscode.Uri.file(fullPath)]
                        }
                );
            });
    }

    getChildren(element?: FolderTreeItem): Thenable<FolderTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No directory open');
            return Promise.resolve([]);
        }

        if (element && !fs.statSync(element.fullPath).isDirectory()) {
            // File clicked: extract and return functions and classes inside the file
            return Promise.resolve(this.extractFunctionsFromFile(element.fullPath));
        }

        const dirPath = element ? element.fullPath : this.workspaceRoot;
        const children = this.getChildrenOfDirectory(dirPath);

        return Promise.resolve(children);
    }

    getTreeItem(element: FolderTreeItem): vscode.TreeItem {
        return element;
    }
}

// // Register the "Play Function" Command
// vscode.commands.registerCommand('extension.playFunction', (filePath: string, functionName: string) => {
//     const fileExtension = path.extname(filePath); // Extract file extension from the file path
//     const additionalPrompts = ''; // Set additional prompts if needed
//     const singleUtgTest = true; // Adjust this flag based on your requirements

//     vscode.commands.executeCommand(
//         'keploy.utg', // Command name
//         filePath, // Argument 1
//         functionName, // Argument 2
//         fileExtension, // Argument 3
//         additionalPrompts, // Argument 4
//         singleUtgTest // Argument 5
//     );
// });
