# Keploy VS Code Extension

Keploy is a Visual Studio Code extension designed to help developers record and replay test cases directly within the IDE.

> Note:  This extension currently supports only Go, Node, Python and Java programming language.

## Features

### Record and Replay TestCases. 
### View Previous TestRun Result.
### View and Edit Keploy Config File


## Installation

1. Install the Keploy extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/).

2. Keploy CLI is present : - `curl --silent -O -L https://keploy.io/install.sh && source install.sh`


## Contirbution Guide

### Start in development mode

1. Run `npm install` to install any dependencies.

2. Press `F5` to open a new window with your extension loaded.

3. Set breakpoints in your code inside `src/extension.ts` to debug your extension.

4. From the debug console, you can see the output or errors if any.

### Make changes to Frontend

1. Run `npm run rollup` to compile your svelte files into js files present in `out/compiled` dir.

2. Make changes to your svelte code and the js files will be automatically re-compiled.

3. Inorder to view your changes, after starting the extension in development mode, Press (`Ctrl+R` or `Cmd+R` on Mac) to reload the window with the fresh compiled js.

4. To view the dev tools, press `ctrl + shift + p` to open the command palette and run `> Developer: Open Webview Developer tools` to open chrome dev tools.


### Make 

1. You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.

2. You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

3. `package.json` - this is the manifest file in which you declare your extension and command.
  * The sample plugin registers a command and defines its title and command name. With this information VS Code can show the command in the command palette. It doesn’t yet need to load the plugin.

4. `src/extension.ts` - this is the main file where you will provide the implementation of your command.
  * The file exports one function, `activate`, which is called the very first time your extension is activated (in this case by executing the command). Inside the `activate` function we call `registerCommand`.

  * We pass the function containing the implementation of the command as the second parameter to `registerCommand`.