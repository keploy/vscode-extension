import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { findTestCasesForFunction } from './extension';

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

        console.log("here deepak ", label);

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
            this.contextValue = 'functionItem';

        }

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

            if (!isDirectory &&          
                (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.go') || item.endsWith('.java') || item.endsWith('.py'))
            ) {
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
        const extension = path.extname(filePath).toLowerCase(); // Get file extension

 

        const functionRegex = /function\s+(\w+)\s*\(/g;
        const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(/g;
        const classRegex = /class\s+(\w+)\s+/g;
        const goFunctionRegex = /func\s+(\w+)\s*\(/g; // Regex for Go functions
        const pythonFunctionRegex = /def\s+(\w+)\s*\(/g; // Python functions
        const javaMethodRegex = /(public|private|protected)?\s+\w+\s+(\w+)\s*\(/g; // Java methods

        const items: FolderTreeItem[] = [];
        let match;

        // Extract functions

        if(extension == '.js' || extension == ".ts"){
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

        if(extension == ".go"){
                //fofr the go functions
        while ((match = goFunctionRegex.exec(content)) !== null) {
            items.push(
                new FolderTreeItem(
                    match[1],
                    vscode.TreeItemCollapsibleState.None,
                    filePath,
                    'function',
                )
            );
        }
        }
    
        if(extension == ".py"){
                 // Extract Python functions
        while ((match = pythonFunctionRegex.exec(content)) !== null) {
            items.push(
                new FolderTreeItem(
                    match[1],
                    vscode.TreeItemCollapsibleState.None,
                    filePath,
                    'function',
                )
            );
        }
        }
     

        //for the java
        if(extension == ".java"){
            while ((match = javaMethodRegex.exec(content)) !== null) {
                const methodName = match[2]; // Capture the method name
                items.push(
                    new FolderTreeItem(
                        methodName,
                        vscode.TreeItemCollapsibleState.None,
                        filePath,
                        'function',
                    )
                );
            }
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
                    : itemName.endsWith('.js') ||
                    itemName.endsWith('.ts') ||
                    itemName.endsWith('.go') ||
                    itemName.endsWith('.java') ||
                    itemName.endsWith('.py');
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
                            arguments: [vscode.Uri.file(fullPath)],

                        }
                );
            });
    }

    async getChildren(element?: FolderTreeItem): Promise<FolderTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No directory open');
            return Promise.resolve([]);
        }

        if (element && !fs.statSync(element.fullPath).isDirectory()) {
            // File clicked: extract and return functions and classes inside the file
            const  items = this.extractFunctionsFromFile(element.fullPath);

            items.forEach(async(item) => {
                if (item.itemType === 'function') {
                    await this.updateContextValueAsync(item.label , item.fullPath , item);
                    //call the uodateConTextvalueasync here
                } 
            });

            return Promise.resolve(items);
        }

        const dirPath = element ? element.fullPath : this.workspaceRoot;
        const children = this.getChildrenOfDirectory(dirPath);

        return Promise.resolve(children);
    }

     async updateContextValueAsync(label: string, fullPath: string , item:any) {
        try {
            const FunctionNameTree = label;
            const fileExtensionTree = path.extname(fullPath); // Extract file extension
            console.log("FunctionName tree and fileExtenionTree" , FunctionNameTree , fileExtensionTree);
            const testFilesPath = await findTestCasesForFunction(FunctionNameTree, fileExtensionTree);
            console.log("testFilePaths bete" , testFilesPath)
            console.log("yes hai bhai " , testFilesPath?.length);
            if (testFilesPath) {
                // Update context value to indicate test files are available
                item.contextValue = 'testFileAvailableBothItem';
            }else{
                console.log("ye tho fasa kam se jam")
                item.contextValue = 'functionItem';
            } 
            console.log(`Context value set to: ${item.contextValue}`);
            // Optionally, trigger UI refresh if the TreeView needs to reflect the change
            // vscode.commands.executeCommand('folderExplorer.Realrefresh');
        } catch (error) {
            console.error("Error updating context value:", error);
        }
    }

    getTreeItem(element: FolderTreeItem): vscode.TreeItem {
        return element;
    }
}

//only removing the test files is remaining.
