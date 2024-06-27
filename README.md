# Keploy VS Code Extension

Keploy is a Visual Studio Code extension designed to help developers record and replay test cases directly within the IDE.

#### Note:  This extension currently supports only Go, Node, Python and Java programming language.

## Features

### Record Test Cases
### Replay Test Cases
### View Previous Test Results
### View Keploy Config File




## Installation

1. Install the Keploy extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/).

## Development Setup

## To start the development mode

* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `Hello World`.
* Set breakpoints in your code inside `src/extension.ts` to debug your extension.
* Find output from your extension in the debug console.

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

* `package.json` - this is the manifest file in which you declare your extension and command.
  * The sample plugin registers a command and defines its title and command name. With this information VS Code can show the command in the command palette. It doesn’t yet need to load the plugin.
* `src/extension.ts` - this is the main file where you will provide the implementation of your command.
  * The file exports one function, `activate`, which is called the very first time your extension is activated (in this case by executing the command). Inside the `activate` function we call `registerCommand`.
  * We pass the function containing the implementation of the command as the second parameter to `registerCommand`.


## Release Notes

### 1.0.0

Initial release of Keploy.

- Record test cases for Go projects.
- Replay recorded test cases.