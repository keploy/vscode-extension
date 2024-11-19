import { promises as fs } from 'fs';
import * as path from 'path';
import { findTestCasesForFunction } from './extension';
interface FolderItem {
  label: string;
  fullPath: string;
  itemType: 'folder' | 'file' | 'class' | 'function';
  children: FolderItem[]; // Children for folders or functions for files
  contextValue?:string;
  testFilePath?:string;
}

async function extractFunctionsFromFile(filePath: string): Promise<FolderItem[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const extension = path.extname(filePath).toLowerCase();

  const functionRegex = /function\s+(\w+)\s*\(/g;
  const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(/g;
  const classRegex = /class\s+(\w+)\s+/g;
  const goFunctionRegex = /func\s+(\w+)\s*\(/g;
  const pythonFunctionRegex = /def\s+(\w+)\s*\(/g;
  const javaMethodRegex = /(public|private|protected)?\s+\w+\s+(\w+)\s*\(/g;

  const items: FolderItem[] = [];
  let match;

  // For JavaScript and TypeScript files
  if (extension === '.js' || extension === '.ts') {
    while ((match = functionRegex.exec(content)) !== null) {
      items.push({
        label: match[1],
        fullPath: filePath,
        itemType: 'function',
        children: [],
      });
    }
    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      items.push({
        label: match[1],
        fullPath: filePath,
        itemType: 'function',
        children: [],
      });
    }
  }

  // For JavaScript, TypeScript, and Java files
  if (extension === '.js' || extension === '.ts' || extension === '.java') {
    while ((match = classRegex.exec(content)) !== null) {
      items.push({
        label: match[1],
        fullPath: filePath,
        itemType: 'class',
        children: [],
      });
    }
  }

  // For Go files
  if (extension === '.go') {
    while ((match = goFunctionRegex.exec(content)) !== null) {
      items.push({
        label: match[1],
        fullPath: filePath,
        itemType: 'function',
        children: [],
      });
    }
  }

  // For Python files
  if (extension === '.py') {
    while ((match = pythonFunctionRegex.exec(content)) !== null) {
      items.push({
        label: match[1],
        fullPath: filePath,
        itemType: 'function',
        children: [],
      });
    }
  }

  // For Java files
  if (extension === '.java') {
    while ((match = javaMethodRegex.exec(content)) !== null) {
      const methodName = match[2]; // Capture the method name
      items.push({
        label: methodName,
        fullPath: filePath,
        itemType: 'function',
        children: [],
      });
    }
  }

  await Promise.all(
    items.map(async (item) => {
      if (item.itemType === 'function') {
        try {
          const result = await updateContextValueAsync(item.label, filePath);
          item.contextValue = result.contextValue;
          if (result.testFilesPath) {
            item.testFilePath = result.testFilesPath[0];
            console.log(`Test files for ${item.label}: ${result.testFilesPath[0]}`);
          }
        } catch (error) {
          console.error(`Error updating context value for ${item.label}:`, error);
        }
      }
    })
  );

  return items;
}
async function updateContextValueAsync(
  label: string,
  fullPath: string
): Promise<{ contextValue: string; testFilesPath?: string[] }> {
  try {
    const functionNameTree = label;
    const fileExtensionTree = path.extname(fullPath); // Extract file extension
    console.log("FunctionName tree and fileExtensionTree", functionNameTree, fileExtensionTree);

    const testFilesUri = await findTestCasesForFunction(functionNameTree, fileExtensionTree);

    if (testFilesUri) {
      const testFilesPath = testFilesUri.map((uri) => uri.fsPath); // Convert Uri[] to string[]
      return { contextValue: 'testFileAvailableBothItem', testFilesPath };
    } else {
      console.log("No test files found");
      return { contextValue: 'functionItem' };
    }
  } catch (error) {
    console.error("Error updating context value:", error);
    return { contextValue: 'functionItem' }; // Fallback context value
  }
}

async function scanDirectory(dirPath: string): Promise<FolderItem[]> {
  const itemNames = await fs.readdir(dirPath);

  const directoryContent = await Promise.all(
    itemNames
      .filter((itemName) => itemName !== 'node_modules') // Exclude node_modules
      .filter((itemName) => !isTestFile(itemName)) // Exclude test files and folders
      .map(async (itemName): Promise<FolderItem | null> => {
        const fullPath = path.join(dirPath, itemName);
        const stat = await fs.stat(fullPath);
        const isDirectory = stat.isDirectory();

        if (isDirectory) {
          const children = await scanDirectory(fullPath); // Recursively scan the subdirectory
          if (children.length > 0) {
            // Include the folder only if it has valid children
            return {
              label: itemName,
              fullPath,
              itemType: 'folder',
              children,
            };
          }
          return null; // Exclude empty or invalid folders
        } else if (isValidFile(itemName)) {
          const children = await extractFunctionsFromFile(fullPath); // Add functions as children
          return {
            label: itemName,
            fullPath,
            itemType: 'file',
            children,
          };
        }
        return null; // Skip invalid files
      })
  );

  // Filter out null values after resolving all promises
  return directoryContent.filter((item): item is FolderItem => item !== null);
}

// Helper function to check if a file is valid (based on extensions)
function isValidFile(fileName: string): boolean {
  const validExtensions = ['.js', '.ts', '.py', '.go', '.java'];
  return validExtensions.some((ext) => fileName.endsWith(ext));
}

// Helper function to check if a file or folder is a test file/folder
function isTestFile(fileName: string): boolean {
  const lowerCaseName = fileName.toLowerCase();
  return lowerCaseName.includes('test') || lowerCaseName.includes('.spec');
}


async function getFolderStructure(workspaceRoot: string): Promise<FolderItem[]> {
  if (!workspaceRoot) {
    throw new Error('Workspace root is not defined');
  }

  try {
    return await scanDirectory(workspaceRoot);
  } catch (error) {
    console.error('Error scanning directory:', error);
    return [];
  }
}

export default getFolderStructure;
